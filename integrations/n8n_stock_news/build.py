"""Regenerate n8n exports from the reviewed JS snippets. No network calls."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NORMALIZE = (ROOT / 'code/normalize.js').read_text()
RETRY = (ROOT / 'code/retry.js').read_text()


class Workflow:
    def __init__(self, name, timeout):
        self.data = dict(name=name, nodes=[], connections={}, active=False,
            settings=dict(executionOrder='v1', timezone='Asia/Hong_Kong', executionTimeout=timeout,
                saveDataSuccessExecution='none', saveDataErrorExecution='none',
                saveManualExecutions=False, saveExecutionProgress=False))

    def node(self, name, kind, params, version=1, **extra):
        self.data['nodes'].append(dict(id=str(len(self.data['nodes'])+1), name=name,
            type=kind, typeVersion=version, position=[len(self.data['nodes'])*240, 0],
            parameters=params, **extra))
        return name

    def code(self, name, source):
        return self.node(name,'n8n-nodes-base.code',dict(jsCode=source),2)

    def edge(self, a, b, output=0):
        main = self.data['connections'].setdefault(a,dict(main=[]))['main']
        while len(main)<=output: main.append([])
        main[output].append(dict(node=b,type='main',index=0))

    def condition(self, name, expression):
        return self.node(name,'n8n-nodes-base.if',dict(conditions=dict(
            options=dict(caseSensitive=True,leftValue='',typeValidation='strict'),
            conditions=[dict(id=name,leftValue=expression,rightValue=True,
                operator=dict(type='boolean',operation='true',singleValue=True))],combinator='and')),2.2)

    def postgres(self,name,query,values):
        return self.node(name,'n8n-nodes-base.postgres',dict(operation='executeQuery',query=query,
            options=dict(queryReplacement=values)),2.6)

    def claim(self,plan):
        self.postgres('Claim batch','SELECT news_ingest.claim_batch($1,$2::jsonb) AS result;',
            '={{ [$json.batch_key, JSON.stringify($json.config)] }}')
        self.condition('New batch?', '={{ $json.result.acquired }}')
        self.code('Existing batch status', 'return [{json:$json.result}];')
        self.edge(plan,'Claim batch');self.edge('Claim batch','New batch?')
        self.edge('New batch?','Existing batch status',1)

    def commit(self,source):
        self.postgres('Commit complete batch','SELECT news_ingest.commit_batch($1,$2::jsonb) AS receipt;',
            '={{ [$json.batch_key, JSON.stringify($json.articles)] }}')
        self.edge(source,'Commit complete batch')

    def retries(self,request,plan,next_node):
        classify = self.code('Classify '+request, RETRY +
            f"\nreturn [{{json:classify($json,$runIndex+1,$('{plan}').first().json.deadline)}}];")
        gate = self.condition('Retry '+request+'?', '={{ $json.retry }}')
        wait = self.node('Backoff '+request,'n8n-nodes-base.wait',
            dict(resume='timeInterval',amount='={{ $json.delay_seconds }}',unit='seconds'),1.1)
        self.edge(request,classify);self.edge(classify,gate)
        self.edge(gate,wait);self.edge(wait,request);self.edge(gate,next_node,1)

    def save(self,filename):
        positions = {'Called by research app':[0,0], 'Daily 08:00 Hong Kong':[0,0],
            'Manual daily run':[0,200], 'Company request':[240,0], 'Plan daily batch':[240,0],
            'Claim batch':[480,0], 'New batch?':[720,0], 'Existing batch status':[720,250]}
        requests = ['Fetch own MCP'] if filename.startswith('01') else [
            'Fetch economy_macro','Fetch economy_fiscal','Fetch broad_candidates']
        for i,request in enumerate(requests):
            y=i*500
            positions.update({request:[960,y], 'Classify '+request:[1200,y],
                'Retry '+request+'?':[1440,y], 'Backoff '+request:[1200,y+200]})
        if filename.startswith('01'):
            positions.update({'Validate company news':[1680,0], 'Commit complete batch':[1920,0]})
        if filename.startswith('02'):
            for i,topic in enumerate(['economy_macro','economy_fiscal','broad_candidates']):
                positions['Validate '+topic]=[1680,i*500]
                if i: positions['Quota spacing '+topic]=[1680,(i-1)*500+250]
            positions.update({'Combine validated streams':[1920,1000], 'Commit complete batch':[2160,1000]})
        for node in self.data['nodes']:
            node['position']=positions.get(node['name'],node['position'])
        (ROOT/'workflows'/filename).write_text(json.dumps(self.data,indent=2)+'\n')


company = Workflow('Company news - own YFinance MCP - up to 3 articles',60)
company.node('Called by research app','n8n-nodes-base.executeWorkflowTrigger',dict(inputSource='passthrough'),1.1)
company.code('Company request', """const symbol=String($json.symbol || '').toUpperCase();
if (!['MSFT','AAPL','NVDA'].includes(symbol)) throw new Error('unsupported_symbol');
if (typeof $json.batch_key !== 'string' || !/^[a-zA-Z0-9:._-]{1,180}$/.test($json.batch_key)) throw new Error('batch_key_required');
return [{json:{symbol,batch_key:$json.batch_key,deadline:Date.now()+25000,
  config:{provider:'own-yfinance-mcp',symbol,max_items:3,policy:'v1',
    coverage:'At most three returned company articles; not comprehensive news coverage.'}}}];""")
company.edge('Called by research app','Company request');company.claim('Company request')
company.node('Fetch own MCP','@n8n/n8n-nodes-langchain.mcpClient',dict(
    serverTransport='httpStreamable',endpointUrl='https://YOUR-YFINANCE-MCP.invalid/mcp',authentication='headerAuth',
    tool=dict(mode='id',value='REPLACE_WITH_YOUR_NEWS_TOOL'),inputMode='json',
    jsonInput="={{ {symbol: $('Company request').first().json.symbol, max_items: 3} }}",
    options=dict(timeout=10000,convertToBinary=False)),1.1,onError='continueRegularOutput',retryOnFail=False)
company.edge('New batch?','Fetch own MCP')
company.code('Validate company news',NORMALIZE+"""
const cfg=$('Company request').first().json;
const news=company($json.response,cfg.symbol);
return [{json:{symbol:cfg.symbol,news,batch_key:cfg.batch_key,
  articles:news.map(n=>({...n,topic:'company:'+cfg.symbol}))}}];""")
company.retries('Fetch own MCP','Company request','Validate company news')
company.commit('Validate company news');company.save('01-company-news.json')

daily = Workflow('Daily macro fiscal and geopolitical candidates - Alpha Vantage',600)
daily.node('Daily 08:00 Hong Kong','n8n-nodes-base.scheduleTrigger',
    dict(rule=dict(interval=[dict(field='cronExpression',expression='0 8 * * *')])),1.2)
daily.node('Manual daily run','n8n-nodes-base.manualTrigger',{})
daily.code('Plan daily batch',"""const end=new Date();
end.setUTCHours(0,0,0,0);
const start=new Date(end.getTime()-48*3600000);
const fmt=d=>d.toISOString().replace(/[-:]/g,'').slice(0,13);
// Fixed UTC midnight makes the query window stable on replay. A 48h overlap catches some late items.
return [{json:{batch_key:'global:'+end.toISOString().slice(0,10)+':v1',
 deadline:Date.now()+540000,time_from:fmt(start),time_to:fmt(end),
 config:{provider:'alphavantage',policy:'v1',time_from:fmt(start),time_to:fmt(end),topics:['economy_macro','economy_fiscal','broad_candidates'],
 coverage:'Latest 100/query in a rolling 48h window. May be truncated. Broad feed is geopolitical candidates, not verified geopolitical coverage.'}}}];""")
daily.edge('Daily 08:00 Hong Kong','Plan daily batch');daily.edge('Manual daily run','Plan daily batch')
daily.claim('Plan daily batch')
for i,topic in enumerate(['economy_macro','economy_fiscal','broad_candidates']):
    name='Fetch '+topic
    params=[dict(name='function',value='NEWS_SENTIMENT'),dict(name='sort',value='LATEST'),dict(name='limit',value='100'),
        dict(name='time_from',value="={{ $('Plan daily batch').first().json.time_from }}"),
        dict(name='time_to',value="={{ $('Plan daily batch').first().json.time_to }}")]
    if topic!='broad_candidates': params.append(dict(name='topics',value=topic))
    daily.node(name,'n8n-nodes-base.httpRequest',dict(url='https://www.alphavantage.co/query',
        authentication='genericCredentialType',genericAuthType='httpQueryAuth',
        sendQuery=True,queryParameters=dict(parameters=params),options=dict(timeout=10000,
        response=dict(response=dict(fullResponse=True,neverError=True,responseFormat='json')))),4.2,
        onError='continueRegularOutput',retryOnFail=False)
    daily.code('Validate '+topic,NORMALIZE+f"\nreturn [{{json:{{articles:daily($json.response,'{topic}')}}}}];")
    daily.retries(name,'Plan daily batch','Validate '+topic)
    if i==0: daily.edge('New batch?',name)
    else:
        wait='Quota spacing '+topic
        daily.node(wait,'n8n-nodes-base.wait',dict(resume='timeInterval',amount=65,unit='seconds'),1.1)
        daily.edge('Validate '+['economy_macro','economy_fiscal'][i-1],wait);daily.edge(wait,name)
daily.code('Combine validated streams',"""const cfg=$('Plan daily batch').first().json;
if(Date.now()>cfg.deadline) throw new Error('acquisition_deadline_exhausted');
return [{json:{batch_key:cfg.batch_key,articles:[
 ...$('Validate economy_macro').first().json.articles,
 ...$('Validate economy_fiscal').first().json.articles,
 ...$('Validate broad_candidates').first().json.articles]}}];""")
daily.edge('Validate broad_candidates','Combine validated streams')
daily.commit('Combine validated streams');daily.save('02-daily-context.json')

example=dict(symbol='MSFT',news=[dict(title=f'Fictional company event {i}',summary=None,
    publisher='Demo publisher',publishedAt=f'2026-11-{17-i:02d}T08:00:00Z',
    url=f'https://example.com/news/{i}',content=f'Fictional source excerpt {i}.') for i in range(1,4)])
(ROOT/'examples/company-news.json').write_text(json.dumps(example,indent=2)+'\n')
(ROOT/'examples/company-request.json').write_text(json.dumps(dict(symbol='MSFT',batch_key='research-run-001:MSFT'),indent=2)+'\n')
demo=Workflow('Offline example - three news items - no API or database',60)
demo.node('Run offline demo','n8n-nodes-base.manualTrigger',{})
demo.code('Fictional MCP response','return [{json:'+json.dumps(example)+'}];')
demo.code('Validate three news items',NORMALIZE+"\nreturn [{json:{symbol:'MSFT',news:company($json,'MSFT')}}];")
demo.edge('Run offline demo','Fictional MCP response');demo.edge('Fictional MCP response','Validate three news items')
demo.save('00-offline-demo.json')
print('Generated three inactive workflows and two examples.')
