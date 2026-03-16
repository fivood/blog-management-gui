# Fukkiorg Deployment Fixes Bugfix Design

## Overview

This design addresses three critical bugs in the fukkiorg blog deployment system that affect article publishing workflow and site functionality. The bugs are:

1. **Date Reset Bug**: Manually set publish dates are being overwritten with the current date during article updates
2. **Slug Not Working**: Custom URL aliases (slugs) are ignored, causing URLs to use UUIDs instead
3. **Empty Categories**: Categories page displays no content despite articles having categories assigned

The root causes span across the ArticleService, HugoIntegration, and Hugo configuration layers. The fixes require careful preservation of existing functionality while correcting the defective behaviors.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the three bugs
- **Property (P)**: The desired correct behavior for each bug scenario
- **Preservation**: Existing behaviors that must remain unchanged by the fixes
- **ArticleService**: The service in `blog-management-gui/src/main/services/ArticleService.ts` that manages article CRUD operations
- **HugoIntegration**: The integration layer in `src/integrations/HugoIntegration.ts` that converts articles to Hugo frontmatter
- **publishedAt**: The article property that stores the original publish date
- **slug**: The custom URL alias stored in article metadata
- **categories**: Taxonomy field in Hugo for article categorization

## Bug Details

### Bug 1: Date Reset Bug

#### Bug Condition

The bug manifests when a user manually sets a publish date in the article editor (e.g., 2025-05-31), saves the article, then later edits and saves it again. The `updateArticle` function in ArticleService overwrites the `publishedAt` field with the current date instead of preserving the manually set date.

**Formal Specification:**
```
FUNCTION isBugCondition1(input)
  INPUT: input of type ArticleUpdate with publishDate field
  OUTPUT: boolean
  
  RETURN input.publishDate IS NOT undefined
         AND input.publishDate != currentDate()
         AND article.publishedAt WAS PREVIOUSLY SET
         AND article.publishedAt != input.publishDate AFTER update
END FUNCTION
```

#### Examples

- User creates article on 2026-03-15, sets publish date to 2025-05-31
- User edits article content on 2026-03-15
- Expected: publish date remains 2025-05-31
- Actual: publish date changes to 2026-03-15 (bug)

### Bug 2: Slug Not Working

#### Bug Condition

The bug manifests when a user fills in the URL alias field in the article editor with a custom slug (e.g., "my-custom-slug"). The system generates URLs using the article UUID instead of the custom slug, resulting in URLs like `/posts/7f9e70d1-2921-44c9-bc52-392148eb8070/` instead of `/posts/my-custom-slug/`.

**Formal Specification:**
```
FUNCTION isBugCondition2(input)
  INPUT: input of type Article with metadata.slug field
  OUTPUT: boolean
  
  RETURN input.metadata.slug IS NOT undefined
         AND input.metadata.slug IS NOT empty string
         AND generatedURL CONTAINS input.id (UUID)
         AND generatedURL DOES NOT CONTAIN input.metadata.slug
END FUNCTION
```

#### Examples

- User creates article with title "1815" and slug "1815"
- Expected: URL is /posts/1815/
- Actual: URL is /posts/7f9e70d1-2921-44c9-bc52-392148eb8070/ (bug)

### Bug 3: Empty Categories

#### Bug Condition

The bug manifests when articles have categories assigned in their frontmatter (e.g., "未归档报告", "长篇"), but the categories page at /categories shows no content. The categories taxonomy is configured in hugo.toml but the page displays empty.

**Formal Specification:**
```
FUNCTION isBugCondition3(input)
  INPUT: input of type HugoSite with articles having categories
  OUTPUT: boolean
  
  RETURN EXISTS article WHERE article.categories.length > 0
         AND categoriesPageExists()
         AND categoriesPageContent IS empty OR shows no articles
END FUNCTION
```

#### Examples

- Article "1815" has category "长篇" in frontmatter
- Article "未归档报告 第二章" has category "未归档报告" in frontmatter
- Expected: /categories page lists both categories with article links
- Actual: /categories page shows no content (bug)

## Expected Behavior

### Bug 1: Date Preservation

**Correct Behavior:**
When a user manually sets a publish date and later edits the article, the system SHALL preserve the original publish date in the `date` field and only update `lastmod` to reflect the modification time.

### Bug 2: Slug Functionality

**Correct Behavior:**
When a user fills in the URL alias field with a custom slug, the system SHALL generate URLs using that slug by properly configuring the slug in Hugo frontmatter and ensuring Hugo's permalink configuration respects it.

### Bug 3: Categories Display

**Correct Behavior:**
When articles have categories assigned in their frontmatter, the categories page SHALL display all categories with links to articles in each category, properly utilizing Hugo's taxonomy system.

### Preservation Requirements

**Unchanged Behaviors:**
- When a user creates a new article without specifying a publish date, the system SHALL continue to use the current date
- When a user creates an article without specifying a URL alias, the system SHALL continue to use the UUID-based filename
- When a user updates article content, the system SHALL continue to update the lastmod field
- When articles have tags assigned, the system SHALL continue to display tags correctly
- When articles are published or unpublished, the system SHALL continue to respect the draft status

**Scope:**
All article operations that do NOT involve manually setting publish dates, custom slugs, or category assignments should be completely unaffected by these fixes.

## Hypothesized Root Cause

Based on the bug descriptions and code analysis, the most likely issues are:

### Bug 1: Date Reset Root Cause

1. **Incorrect Date Field Mapping**: The `HugoIntegration.toHugoFrontMatter` function uses `article.publishedAt || article.createdAt` for the `date` field, but the `updateArticle` function may not be properly preserving `publishedAt` when updates occur
   
2. **Missing Conditional Logic**: The update logic doesn't distinguish between "user is changing the publish date" vs "user is just editing content and date should be preserved"

3. **ArticleManager Overwrite**: The `modifyArticle` call may be resetting fields that weren't explicitly included in the update

### Bug 2: Slug Not Working Root Cause

1. **Missing Permalink Configuration**: Hugo's `hugo.toml` doesn't have a `[permalinks]` section configured to use the slug field for posts

2. **Slug Field Not in Frontmatter**: The `HugoIntegration.toHugoFrontMatter` includes `slug` in frontmatter, but Hugo may not be configured to use it

3. **Filename vs Slug Priority**: Hugo defaults to using the filename (UUID.md) for URL generation unless explicitly configured otherwise

### Bug 3: Empty Categories Root Cause

1. **Taxonomy Configuration Issue**: While `hugo.toml` has `[taxonomies]` configured, there may be a mismatch between the taxonomy name and how it's used

2. **Missing Categories Template**: Hugo may lack the proper template files to render the categories list page

3. **Build/Deployment Issue**: The categories pages may not be generated during the Hugo build process, or the public folder may not include them

## Correctness Properties

Property 1: Bug Condition - Date Preservation

_For any_ article update where a publish date was previously set and the user is not explicitly changing the publish date, the fixed updateArticle function SHALL preserve the original publishedAt value and only update the lastmod field to the current timestamp.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Slug URL Generation

_For any_ article where a custom slug is provided in the metadata, the fixed system SHALL generate URLs using that slug instead of the UUID, by properly configuring Hugo's permalink settings and ensuring the slug field is correctly written to frontmatter.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Categories Display

_For any_ article with categories assigned, the fixed Hugo configuration and templates SHALL properly generate category taxonomy pages that list all categories and their associated articles.

**Validates: Requirements 2.3**

Property 4: Preservation - Default Date Behavior

_For any_ new article creation without an explicit publish date, the fixed system SHALL produce the same result as the original system, using the current date as the publish date.

**Validates: Requirements 3.1**

Property 5: Preservation - Default URL Behavior

_For any_ article without a custom slug, the fixed system SHALL produce the same result as the original system, using the UUID-based filename for the URL.

**Validates: Requirements 3.2**

Property 6: Preservation - Modification Timestamp

_For any_ article update, the fixed system SHALL continue to update the lastmod field to reflect the modification time, preserving existing behavior.

**Validates: Requirements 3.3**

Property 7: Preservation - Tags Functionality

_For any_ article with tags assigned, the fixed system SHALL produce the same result as the original system, displaying tags correctly on the tags page.

**Validates: Requirements 3.4**

Property 8: Preservation - Draft Status

_For any_ article publish/unpublish operation, the fixed system SHALL produce the same result as the original system, respecting the draft status in frontmatter.

**Validates: Requirements 3.5**

## Fix Implementation

### Bug 1: Date Reset Fix

**File**: `blog-management-gui/src/main/services/ArticleService.ts`

**Function**: `updateArticle`

**Specific Changes**:

1. **Preserve publishedAt Logic**: Modify the update logic to only change `publishedAt` when explicitly provided in updates
   ```typescript
   // Current problematic code around line 240:
   if (updates.publishDate) {
     article.publishedAt = updates.publishDate;
     await this.articleManager['articles'].set(articleId, article);
   }
   
   // Should be:
   if (updates.publishDate !== undefined) {
     article.publishedAt = updates.publishDate;
   } else {
     // Preserve existing publishedAt - don't let modifyArticle reset it
     const existingPublishedAt = currentArticle.publishedAt;
     article.publishedAt = existingPublishedAt;
   }
   await this.articleManager['articles'].set(articleId, article);
   ```

2. **Ensure modifiedAt Updates**: Verify that `modifiedAt` is always updated to current time on any edit
   ```typescript
   article.modifiedAt = new Date();
   ```

3. **Test Date Preservation**: Verify that editing an article with a past publish date doesn't change the date field in the generated Hugo file

### Bug 2: Slug Not Working Fix

**File 1**: `fukkiorg/hugo.toml`

**Specific Changes**:

1. **Add Permalinks Configuration**: Configure Hugo to use slug field for post URLs
   ```toml
   [permalinks]
   posts = "/:section/:slug/"
   ```

2. **Fallback Handling**: Ensure Hugo falls back to filename if slug is not provided
   ```toml
   # Hugo automatically falls back to filename if :slug is empty
   # No additional configuration needed
   ```

**File 2**: `src/integrations/HugoIntegration.ts`

**Function**: `toHugoFrontMatter`

**Specific Changes**:

1. **Ensure Slug in Frontmatter**: Verify slug is properly written (already done at line 28)
   ```typescript
   slug: article.metadata.slug || undefined,
   ```

2. **Use Filename as Fallback**: When no slug provided, ensure filename (UUID) is used
   - This is already handled by Hugo's default behavior
   - No code change needed

**File 3**: `blog-management-gui/src/main/services/ArticleService.ts`

**Function**: `createArticle` and `updateArticle`

**Specific Changes**:

1. **Preserve Slug in Metadata**: Ensure slug is properly stored in article metadata
   ```typescript
   // In createArticle, already handled by line 145:
   slug: data.slug
   
   // In updateArticle, ensure slug updates are preserved:
   if (updates.slug !== undefined) {
     updateData.metadata = { 
       ...currentArticle.metadata,
       slug: updates.slug
     };
   }
   ```

### Bug 3: Empty Categories Fix

**File 1**: `fukkiorg/hugo.toml`

**Analysis**: The taxonomy configuration looks correct:
```toml
[taxonomies]
category = "categories"
tag = "tags"
```

**Potential Issue**: Check if the theme supports categories or if custom layouts are needed

**File 2**: Theme layouts (if needed)

**Specific Changes**:

1. **Verify Theme Support**: Check if `fukkiorg/themes/paper/` has category list templates
   - Look for `layouts/categories/list.html` or `layouts/_default/terms.html`

2. **Create Custom Layout if Missing**: If theme doesn't support categories, create:
   ```
   fukkiorg/layouts/categories/list.html
   ```
   With basic category listing template

3. **Verify Frontmatter Format**: Ensure categories in frontmatter match expected format
   ```yaml
   categories:
     - 未归档报告
     - 长篇
   ```

**File 3**: `src/integrations/HugoIntegration.ts`

**Function**: `toHugoFrontMatter`

**Verification**:

1. **Check Categories Output**: Verify categories are properly written (line 24):
   ```typescript
   categories: article.categories.length > 0 ? article.categories : undefined,
   ```

2. **Ensure Proper YAML Format**: The `objectToYaml` function should output categories as array:
   ```yaml
   categories:
     - category1
     - category2
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify each bug exists on unfixed code by reproducing the defective behavior, then verify the fixes work correctly and preserve existing functionality.

### Exploratory Bug Condition Checking

**Goal**: Confirm each bug exists in the current codebase before implementing fixes. Document the exact reproduction steps and observed behavior.

**Test Plan**: Create test articles with specific configurations and observe the buggy behavior in each case.

**Test Cases**:

1. **Date Reset Test**: Create article with past date (2025-05-31), edit content, verify date changes to current date (will fail on unfixed code)

2. **Slug Test**: Create article with slug "test-slug", verify URL uses UUID instead (will fail on unfixed code)

3. **Categories Test**: Create articles with categories, verify /categories page is empty (will fail on unfixed code)

4. **Combined Test**: Create article with all three features, verify all three bugs manifest (will fail on unfixed code)

**Expected Counterexamples**:
- Date field in Hugo frontmatter changes from 2025-05-31 to 2026-03-15 after edit
- Generated URL is /posts/UUID/ instead of /posts/test-slug/
- Categories page shows no content despite articles having categories

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL article WHERE manualDateWasSet(article) DO
  editArticle(article)
  ASSERT article.publishedAt == originalPublishedAt
  ASSERT article.lastmod == currentTime
END FOR

FOR ALL article WHERE customSlugProvided(article) DO
  generateHugoFile(article)
  buildHugoSite()
  ASSERT articleURL CONTAINS article.slug
  ASSERT articleURL NOT CONTAINS article.id
END FOR

FOR ALL article WHERE categoriesAssigned(article) DO
  buildHugoSite()
  ASSERT categoriesPage EXISTS
  ASSERT categoriesPage CONTAINS article.categories
  ASSERT categoryLinks WORK
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL article WHERE NOT manualDateWasSet(article) DO
  ASSERT createArticle_original(article).publishedAt == createArticle_fixed(article).publishedAt
END FOR

FOR ALL article WHERE NOT customSlugProvided(article) DO
  ASSERT generateURL_original(article) == generateURL_fixed(article)
END FOR

FOR ALL article WHERE tagsAssigned(article) DO
  ASSERT tagsPage_original == tagsPage_fixed
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Create articles with various combinations of fields (with/without dates, slugs, categories, tags) and verify existing behavior is preserved.

**Test Cases**:

1. **Default Date Preservation**: Create article without explicit date, verify it uses current date (before and after fix)

2. **UUID URL Preservation**: Create article without slug, verify URL uses UUID (before and after fix)

3. **Tags Preservation**: Create articles with tags, verify tags page works correctly (before and after fix)

4. **Draft Status Preservation**: Publish/unpublish articles, verify draft field works correctly (before and after fix)

5. **Content Update Preservation**: Edit article content only, verify lastmod updates but other fields unchanged (before and after fix)

### Unit Tests

- Test ArticleService.updateArticle with various date scenarios
- Test HugoIntegration.toHugoFrontMatter with slug field
- Test Hugo build with categories configuration
- Test edge cases: empty slug, undefined date, empty categories array

### Property-Based Tests

- Generate random articles with various field combinations
- Verify date preservation across multiple edits
- Verify slug generation with various slug formats (alphanumeric, hyphens, unicode)
- Verify categories display with various category names (English, Chinese, special characters)

### Integration Tests

- Full workflow: create article with past date → edit → verify date preserved
- Full workflow: create article with slug → build Hugo → verify URL correct
- Full workflow: create articles with categories → build Hugo → verify categories page populated
- Test all three fixes together in combined scenarios
