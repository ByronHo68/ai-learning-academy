package academy.bank;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.filter.OncePerRequestFilter;

@RestController
class BankHttp {
    private final BankService bank;
    BankHttp(BankService bank) { this.bank = bank; }
    record CaseRequest(String accountId, String runId, String reason, String approvalProof) {}
    @GetMapping("/health") Map<String, Object> health() { return Map.of("status", "ok", "synthetic", true); }
    @GetMapping("/api/accounts/{id}") BankService.Account account(@PathVariable String id) { return bank.account(id); }
    @GetMapping("/api/accounts/{id}/transactions") List<BankService.Transaction> transactions(@PathVariable String id) { return bank.transactions(id); }
    @GetMapping("/api/review-cases") List<BankService.ReviewCase> cases() { return bank.cases(); }
    @PostMapping("/api/review-cases") BankService.ReviewCase create(@RequestBody CaseRequest request) {
        return bank.openCase(request.accountId(), request.runId(), request.reason(), request.approvalProof());
    }
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(org.springframework.http.HttpStatus.BAD_REQUEST)
    Map<String, String> invalid(IllegalArgumentException exception) { return Map.of("error", exception.getMessage()); }
}

@Component
class BankAuth extends OncePerRequestFilter {
    private final byte[] expected;
    BankAuth(@Value("${bank.token}") String token) {
        if (token.length() < 32) throw new IllegalArgumentException("BANK_API_TOKEN needs at least 32 characters");
        expected = ("Bearer " + token).getBytes(StandardCharsets.UTF_8);
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        String supplied = request.getHeader("Authorization");
        if (supplied == null || !MessageDigest.isEqual(expected, supplied.getBytes(StandardCharsets.UTF_8))) {
            response.setStatus(401);
            return;
        }
        chain.doFilter(request, response);
    }
}
