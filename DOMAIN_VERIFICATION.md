# LUSH MILK Domain Migration Verification

This document provides a verification checklist for the domain migration from `lushmilk.com` to `lushmilk.in`.

## Files Updated

### Android Configuration
- [x] `android/AndroidManifest.xml` - Updated deep linking host to `lushmilk.in`
- [x] `android/res/xml/network_security_config.xml` - Updated domain and enabled certificate pinning
- [x] `android/res/xml/backup_rules.xml` - Created file to support Android backup configuration

### Security Services
- [x] `src/services/MobileSecurityService.ts` - Added domain redirection logic in `enforcePlayStoreCompliance`

### Email Services and Templates
- [x] `src/services/EmailService.ts` - Updated `SUPPORT_EMAIL` default value
- [x] `src/services/AutomatedEmailService.ts` - Updated `DEFAULT_FROM` email address
- [x] `src/services/EdgeFunctions/send-cart-reminder.ts` - Updated email sender and URLs

### User-Facing Pages
- [x] `src/pages/RefundPolicy.tsx` - Updated support email address
- [x] `src/pages/Terms.tsx` - Updated info email address
- [x] `src/pages/Contact.tsx` - Updated customer support and orders email addresses
- [x] `src/components/Footer.tsx` - Updated info email address
- [x] `src/app/privacy-policy/page.tsx` - Updated privacy email addresses

### Documentation
- [x] `MOBILE_SECURITY_GUIDE.md` - Updated email addresses
- [x] `ANDROID_TESTING_GUIDE.md` - Updated domain references in testing procedures
- [x] `EMAIL_INTEGRATION.md` - Updated reset password URL
- [x] `SECURITY.md` - Updated security contact email
- [x] `DOMAIN_MIGRATION.md` - Created migration documentation

## Verification Tests

Before deploying the updated application, ensure the following tests are performed:

1. **Network Requests**
   - [ ] Verify all API calls target the correct domain
   - [ ] Test certificate pinning with real production certificates

2. **Deep Linking**
   - [ ] Test opening app via `https://lushmilk.in` links
   - [ ] Verify product-specific deep links function correctly

3. **Email Flows**
   - [ ] Test account creation email flow
   - [ ] Test password reset email flow
   - [ ] Test order confirmation emails
   - [ ] Test cart abandonment emails

4. **Domain Redirection**
   - [ ] Verify automatic redirection from old domain to new domain

## Additional Tech Stack Requirements

For Android deployment, ensure the following are properly configured:

1. **SSL Certificates**
   - [ ] Obtain and install valid SSL certificate for `lushmilk.in`
   - [ ] Update certificate pins in network security config to match production certificates

2. **DNS Configuration**
   - [ ] Configure proper DNS records for the new domain
   - [ ] Set up optional redirect from old domain to new domain

3. **API Gateway/Backend Updates**
   - [ ] Update any API gateway configurations to accept requests from the new domain
   - [ ] Update CORS settings on backend services

4. **Monitoring and Analytics**
   - [ ] Update monitoring systems to track the new domain
   - [ ] Update analytics to capture domain-specific metrics

## Known Issues

List any known issues or limitations with the domain migration:

1. The linter errors in `AutomatedEmailService.ts` related to the Supabase client need to be addressed separately.
2. The linter errors in the Edge Function and page components are not related to the domain migration and should be fixed in a separate task.

## Rollback Plan

In case the migration needs to be reversed:

1. Revert all code changes to use original domain
2. Deploy a new version with the original domain configuration
3. Configure temporary DNS redirects if needed 