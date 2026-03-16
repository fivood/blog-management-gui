# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - JSON Format Deployment Creation Fails
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case - createDeployment with valid manifest using JSON format
  - Test that createDeployment with manifest containing file hashes fails with error 8000096 on unfixed code
  - The test assertions should match the Expected Behavior Properties from design: API should accept multipart/form-data and return deployment ID
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with Cloudflare API error 8000096 "A 'manifest' field was expected in the request body but was not provided"
  - Document counterexamples found: specific manifest objects that trigger the error
  - Verify request uses Content-Type: application/json (this is the bug condition)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Deployment API Calls Use JSON Format
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-createDeployment API calls
  - Observe: validateCredentials() uses GET with JSON format and returns validation result
  - Observe: uploadBatch() uses POST with JSON format and sends base64 encoded files
  - Observe: finalizeDeployment() uses POST with JSON format
  - Observe: getDeploymentStatus() uses GET with JSON format and maps status correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that all non-createDeployment methods continue using Content-Type: application/json
  - Test that file scanning, hashing, and path normalization produce same results
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix for Cloudflare manifest multipart/form-data format

  - [ ] 3.1 Create makeMultipartRequest method
    - Implement new private method to handle multipart/form-data requests
    - Generate unique boundary string using timestamp and random values
    - Build multipart/form-data request body following RFC 2388 format
    - Set Content-Type header with boundary parameter
    - Handle errors, timeouts, and rate limit updates (similar to makeRequest)
    - _Bug_Condition: isBugCondition(request) where request uses application/json for createDeployment_
    - _Expected_Behavior: Request uses multipart/form-data format with manifest as form field_
    - _Preservation: Other API methods continue using makeRequest with JSON format_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 Modify createDeployment to use multipart/form-data
    - Replace makeRequest call with makeMultipartRequest call
    - Serialize manifest object to JSON string for form field value
    - Ensure manifest field is properly formatted in multipart body
    - Keep endpoint and other logic unchanged
    - _Bug_Condition: Current implementation uses JSON format causing API error 8000096_
    - _Expected_Behavior: Cloudflare API accepts request and returns deployment ID and URL_
    - _Preservation: No changes to other methods (uploadBatch, finalizeDeployment, etc.)_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Multipart Format Deployment Creation Succeeds
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES - Cloudflare API accepts multipart/form-data request and returns deployment ID
    - Verify request uses Content-Type: multipart/form-data; boundary=...
    - Verify manifest field is correctly parsed by Cloudflare API
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Deployment API Calls Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm validateCredentials still uses JSON format
    - Confirm uploadBatch still uses JSON format for base64 file content
    - Confirm finalizeDeployment still uses JSON format
    - Confirm getDeploymentStatus still uses JSON format
    - Confirm file scanning, hashing, path normalization unchanged

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify complete deployment workflow: createDeployment (multipart) → uploadBatch (JSON) → finalizeDeployment (JSON) → getDeploymentStatus (JSON)
  - Verify error handling and rate limiting work correctly across different content types
