# LUSH MILK Domain Migration

This document outlines the changes made to migrate the LUSH MILK application from using the domain `lushmilk.com` to `lushmilk.in`.

## Changes Made

### 1. Android Configuration Files

- **AndroidManifest.xml**: 
  - Updated deep linking configuration to use `lushmilk.in` domain
  - Fixed the network security config attribute placement

- **network_security_config.xml**:
  - Updated domain references from `lushmilk.com` to `lushmilk.in`
  - Enabled certificate pinning for production

- **backup_rules.xml**:
  - Created new file to properly implement backup rules referenced in the manifest

### 2. Security Services

- **MobileSecurityService.ts**:
  - Updated domain redirection logic in `enforcePlayStoreCompliance` function
  - Added logic to handle incorrect domains and redirect to `lushmilk.in`

### 3. Documentation

- **MOBILE_SECURITY_GUIDE.md**:
  - Updated email addresses to use `@lushmilk.in` domain
  - Updated security contact information

- **ANDROID_TESTING_GUIDE.md**:
  - Updated certificate pinning test instructions to reference `lushmilk.in`
  - Added specific deep linking tests for the new domain

## Required Follow-up Actions

1. **Certificate Management**:
   - Ensure SSL certificates are properly configured for the `lushmilk.in` domain
   - Verify certificate pins match the actual certificates used in production

2. **Backend Configuration**:
   - Update any API endpoints to use the new domain
   - Update CORS configurations to allow the new domain

3. **Deployment**:
   - Test deep linking functionality with the new domain
   - Verify redirect logic works correctly in all scenarios
   - Test certificate pinning with the actual production certificates

4. **Email Services**:
   - Ensure email services are configured to use the new domain
   - Update all email templates with the new domain references

## Verification Steps

Before releasing the updated application:

1. Verify all network requests correctly target `lushmilk.in`
2. Test deep linking from external applications and browsers
3. Verify certificate pinning against the production server certificates
4. Test domain redirection logic in both development and production environments
5. Ensure all documentation consistently references the new domain

## Rollback Plan

In case of issues with the domain migration:

1. Revert code changes to use the original domain
2. Prepare a hotfix release with the original domain configuration
3. Configure DNS to temporarily redirect `lushmilk.in` to `lushmilk.com` 