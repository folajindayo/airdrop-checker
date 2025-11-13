# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Airdrop Finder seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@airdr op-finder.com (replace space)

Include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- How you discovered the vulnerability

### What to Expect

After you submit a vulnerability report:

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Investigation**: We will investigate and validate the issue
3. **Communication**: We will keep you informed of our progress
4. **Resolution**: We will work to fix the vulnerability
5. **Disclosure**: We will coordinate public disclosure with you

### Security Best Practices

When contributing to this project, please follow these security best practices:

#### Code Security

- **No Secrets**: Never commit API keys, passwords, or sensitive data
- **Input Validation**: Always validate and sanitize user inputs
- **SQL Injection**: Use parameterized queries (Prisma ORM handles this)
- **XSS Prevention**: Sanitize output, use React's built-in XSS protection
- **CSRF Protection**: Use Next.js built-in CSRF protection
- **Authentication**: Use secure authentication methods (JWT, OAuth)
- **Authorization**: Implement proper access control checks
- **Rate Limiting**: Implement rate limiting on API endpoints
- **Error Handling**: Don't expose sensitive information in error messages

#### Dependencies

- **Regular Updates**: Keep dependencies up to date
- **Audit**: Run `npm audit` regularly
- **Known Vulnerabilities**: Don't use packages with known vulnerabilities
- **Minimal Dependencies**: Only include necessary dependencies

#### Environment Variables

- **Never Commit**: Don't commit `.env` files to version control
- **Use Examples**: Provide `.env.example` files
- **Secure Storage**: Store secrets in secure vault (production)
- **Minimal Permissions**: Use least-privilege principle

#### API Security

- **Authentication**: Require authentication for sensitive endpoints
- **Authorization**: Verify user permissions before accessing resources
- **Rate Limiting**: Implement per-endpoint and per-user rate limits
- **Input Validation**: Validate all input parameters with Zod schemas
- **Output Sanitization**: Sanitize all output data
- **CORS**: Configure CORS properly for production
- **HTTPS**: Always use HTTPS in production
- **Security Headers**: Implement security headers (CSP, HSTS, etc.)

#### Database Security

- **Prepared Statements**: Use Prisma ORM's parameterized queries
- **Least Privilege**: Database users should have minimal permissions
- **Encryption**: Encrypt sensitive data at rest
- **Backup**: Regular automated backups
- **Connection Security**: Use SSL/TLS for database connections

#### Frontend Security

- **XSS Prevention**: Sanitize user-generated content
- **Content Security Policy**: Implement strict CSP headers
- **Secure Cookies**: Use httpOnly, secure, and sameSite flags
- **Dependency Scanning**: Regularly scan frontend dependencies
- **Third-party Scripts**: Minimize and audit third-party scripts

### Known Security Considerations

#### Wallet Interactions

- **User Consent**: Always require explicit user consent for transactions
- **Transaction Preview**: Show clear transaction details before signing
- **Phishing Protection**: Verify contract addresses and transaction data
- **Secure Communication**: Use WalletConnect v2 for secure wallet connections

#### API Keys

- **Client-side**: Only expose public API keys client-side
- **Server-side**: Keep sensitive API keys server-side only
- **Environment Variables**: Store all keys in environment variables
- **Rotation**: Regularly rotate API keys

#### Rate Limiting

Currently implemented rate limits:

- `/api/airdrop-check`: 100 requests per hour per address
- `/api/refresh`: 1 request per 5 minutes per address
- Global: 1000 requests per hour per IP

### Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded secrets or API keys
- [ ] All user inputs are validated
- [ ] All outputs are sanitized
- [ ] Authentication/authorization checks are in place
- [ ] Error messages don't expose sensitive information
- [ ] Rate limiting is implemented where needed
- [ ] Dependencies are up to date and audited
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CORS is properly configured
- [ ] Security headers are set

### Security Tools

We use the following tools to maintain security:

- **npm audit**: Check for vulnerable dependencies
- **Dependabot**: Automated dependency updates
- **TypeScript**: Type safety to prevent common bugs
- **ESLint**: Static code analysis for security issues
- **Prisma**: ORM to prevent SQL injection
- **Next.js**: Framework with built-in security features

### Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed. Users are notified through:

- GitHub Security Advisories
- Release notes
- Email notifications (for registered users)

### Recognition

We believe in recognizing security researchers who help keep our project secure. If you report a valid security vulnerability:

- We will acknowledge your contribution (with your permission)
- Your name will be listed in our security acknowledgments
- We appreciate responsible disclosure

### Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Contact

For security-related questions or concerns:

- Email: security@airdrop-finder.com (replace space)
- GitHub: Create a private security advisory

Thank you for helping keep Airdrop Finder secure!

