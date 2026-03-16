# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Date Reset, Slug Ignored, Empty Categories
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the properties to the concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - Bug 1: Create article with past date (2025-05-31), edit content, assert date remains 2025-05-31 (will fail - date changes to current)
    - Bug 2: Create article with slug "test-slug", assert URL contains "test-slug" not UUID (will fail - URL uses UUID)
    - Bug 3: Create articles with categories, assert /categories page shows content (will fail - page is empty)
  - The test assertions should match the Expected Behavior Properties from design
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Default Behaviors Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Create article without explicit date → observe it uses current date
    - Create article without slug → observe URL uses UUID
    - Create articles with tags → observe tags page works correctly
    - Publish/unpublish articles → observe draft status works correctly
    - Edit article content only → observe lastmod updates but other fields unchanged
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for date reset, slug not working, and empty categories bugs

  - [ ] 3.1 Fix Bug 1: Date Reset in ArticleService
    - Modify `blog-management-gui/src/main/services/ArticleService.ts` updateArticle function
    - Add conditional logic to preserve publishedAt when not explicitly changed
    - Only update publishedAt when updates.publishDate is explicitly provided
    - Always update modifiedAt to current time on any edit
    - Ensure modifyArticle doesn't reset publishedAt field
    - _Bug_Condition: isBugCondition1(input) where input.publishDate was previously set and not being changed_
    - _Expected_Behavior: Preserve original publishedAt, update only lastmod (Property 1 from design)_
    - _Preservation: Default date behavior for new articles unchanged (Property 4 from design)_
    - _Requirements: 2.1, 3.1, 3.3_

  - [ ] 3.2 Fix Bug 2: Slug Not Working in Hugo Configuration
    - Add permalinks configuration to `fukkiorg/hugo.toml`
    - Configure posts permalink pattern to use slug field: `posts = "/:section/:slug/"`
    - Verify HugoIntegration.toHugoFrontMatter properly writes slug to frontmatter (already at line 28)
    - Ensure slug is preserved in article metadata during updates in ArticleService
    - Hugo will automatically fall back to filename (UUID) if slug is empty
    - _Bug_Condition: isBugCondition2(input) where input.metadata.slug is provided but URL uses UUID_
    - _Expected_Behavior: Generate URLs using custom slug (Property 2 from design)_
    - _Preservation: UUID-based URLs for articles without slug unchanged (Property 5 from design)_
    - _Requirements: 2.2, 3.2_

  - [ ] 3.3 Fix Bug 3: Empty Categories Page
    - Verify taxonomy configuration in `fukkiorg/hugo.toml` is correct (already configured)
    - Check if theme `fukkiorg/themes/paper/` has category list templates
    - If missing, create `fukkiorg/layouts/categories/list.html` with category listing template
    - Verify HugoIntegration.toHugoFrontMatter outputs categories as proper YAML array (already at line 24)
    - Ensure categories are properly written to frontmatter in correct format
    - Test Hugo build to verify categories pages are generated in public folder
    - _Bug_Condition: isBugCondition3(input) where articles have categories but /categories page is empty_
    - _Expected_Behavior: Categories page displays all categories with article links (Property 3 from design)_
    - _Preservation: Tags functionality unchanged (Property 7 from design)_
    - _Requirements: 2.3, 3.4_

  - [ ] 3.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Date Preserved, Slug Used, Categories Displayed
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: Expected Behavior Properties 1, 2, 3 from design_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Default Behaviors Still Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fixes (no regressions)
    - _Requirements: Preservation Properties 4, 5, 6, 7, 8 from design_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
