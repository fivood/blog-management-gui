# Bugfix Requirements Document

## Introduction

This document addresses three critical bugs in the fukkiorg blog deployment system that affect article publishing, URL generation, and taxonomy display. These bugs impact the user experience when managing and viewing blog content through the blog-management-gui Electron application and the deployed Hugo site.

The bugs are:
1. Publish date resets to today's date instead of preserving manually set dates
2. URL slug/alias field is ignored, causing URLs to use UUIDs instead of custom slugs
3. Categories page displays no content despite articles having categories assigned

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user manually sets a publish date in the article editor (e.g., 2025-05-31) THEN the system resets the date to the current date (e.g., 2026-03-15) in the lastmod field

1.2 WHEN a user fills in the URL alias field in the article editor with a custom slug THEN the system generates URLs using the article UUID instead of the custom slug (e.g., /posts/7f9e70d1-2921-44c9-bc52-392148eb8070/ instead of /posts/my-custom-slug/)

1.3 WHEN a user creates articles with categories assigned (e.g., "未归档报告", "长篇") THEN the categories page at /categories shows no content despite the categories being present in article front matter

### Expected Behavior (Correct)

2.1 WHEN a user manually sets a publish date in the article editor THEN the system SHALL preserve that date in the date field and only update lastmod when the article is modified

2.2 WHEN a user fills in the URL alias field with a custom slug THEN the system SHALL generate URLs using that slug (e.g., /posts/my-custom-slug/) by configuring Hugo permalinks appropriately

2.3 WHEN articles have categories assigned in their front matter THEN the categories page SHALL display all categories with links to articles in each category

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user creates a new article without specifying a publish date THEN the system SHALL CONTINUE TO use the current date as the publish date

3.2 WHEN a user creates an article without specifying a URL alias THEN the system SHALL CONTINUE TO use the UUID-based filename for the URL

3.3 WHEN a user updates article content THEN the system SHALL CONTINUE TO update the lastmod field to reflect the modification time

3.4 WHEN articles have tags assigned THEN the system SHALL CONTINUE TO display tags correctly on the tags page

3.5 WHEN articles are published or unpublished THEN the system SHALL CONTINUE TO respect the draft status in the front matter
