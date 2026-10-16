import { juniorExamples } from '../../../../lib/junior-examples';

export function generateStaticParams() {
  return Object.keys(juniorExamples).map(id=>({id}));
}

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!Object.hasOwn(juniorExamples,id))return new Response('Unknown lab',{status:404});
  return new Response(juniorExamples[id as keyof typeof juniorExamples]+'\n',{
    headers:{
      'Content-Type':'text/x-python; charset=utf-8',
      'Content-Disposition':`attachment; filename="${id}.py"`,
      'X-Content-Type-Options':'nosniff',
    },
  });
}
