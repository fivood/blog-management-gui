# Implementation Plan: Multi-Blog Management

## Overview

This implementation plan breaks down the Multi-Blog Management feature into discrete coding tasks. The feature enables users to manage multiple independent Hugo-based blogs within a single Electron application instance. Each blog has its own Hugo project, content, and Cloudflare deployment settings, while sharing common themes and the application interface.

The implementation follows a profile-based multi-tenancy pattern where a BlogManager component orchestrates profile management and dynamically reconfigures services when switching between blogs.

## Tasks

- [x] 1. Create core data models and interfaces
  - Create `BlogProfile` interface with all required fields (id, name, displayName, hugoProjectPath, cloudflare, metadata)
  - Create `CreateBlogProfileData` interface for profile creation
  - Create `ValidationResult` interface for validation responses
  - Create `HugoInitOptions` interface for Hugo project initialization
  - Create `ServiceRegistry` interface for service references
  - _Requirements: 1.1, 1.4, 12.1, 12.2, 12.5_

- [ ] 2. Implement BlogManager class
  - [x] 2.1 Create BlogManager class with profile storage
    - Implement constructor with ConfigService and ServiceRegistry dependencies
    - Initialize profiles Map and activeBlogId state
    - _Requirements: 1.1_

  - [x] 2.2 Implement profile CRUD operations
    - Implement `createProfile()` method with validation
    - Implement `updateProfile()` method
    - Implement `deleteProfile()` method
    - Implement `getProfile()` and `listProfiles()` methods
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.3 Write property test for profile persistence
    - **Property 1: Profile persistence round-trip**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 2.4 Write property test for profile name uniqueness
    - **Property 3: Profile name uniqueness**
    - **Validates: Requirements 1.3**

  - [ ]* 2.5 Write property test for profile deletion
    - **Property 4: Profile deletion preserves Hugo files**
    - **Validates: Requirements 1.5**


- [ ] 3. Implement blog switching functionality
  - [x] 3.1 Implement `switchBlog()` method in BlogManager
    - Validate target profile exists and is valid
    - Coordinate service reconfiguration sequence
    - Handle rollback on failure
    - Update and persist active blog ID
    - _Requirements: 2.2, 2.3, 3.6_

  - [x] 3.2 Implement `getActiveBlog()` and `getActiveBlogId()` methods
    - Return current active blog profile
    - Handle null state when no blog is active
    - _Requirements: 2.2_

  - [ ]* 3.3 Write property test for active blog persistence
    - **Property 6: Active blog state persistence**
    - **Validates: Requirements 2.2, 2.5, 2.6**

  - [ ]* 3.4 Write property test for service reconfiguration
    - **Property 7: Service reconfiguration on blog switch**
    - **Validates: Requirements 2.3, 3.1, 3.2, 3.3, 3.4, 3.5**

  - [ ]* 3.5 Write property test for failed switch rollback
    - **Property 8: Failed switch preserves previous state**
    - **Validates: Requirements 3.6**

- [ ] 4. Implement validation logic
  - [x] 4.1 Implement `validateProfile()` method
    - Validate profile name is unique and non-empty
    - Validate Hugo project path exists
    - Validate Hugo project structure
    - Validate Cloudflare credentials
    - Return detailed ValidationResult
    - _Requirements: 1.2, 1.3, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.2 Implement `validateHugoProject()` method
    - Check path exists on filesystem
    - Verify required directories (content, themes, static)
    - Verify Hugo config file exists (hugo.toml/yaml/config.toml)
    - Return specific error messages for missing components
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.3 Write property test for Hugo project path validation
    - **Property 2: Hugo project path validation**
    - **Validates: Requirements 1.2, 8.1**

  - [ ]* 4.4 Write property test for Hugo project structure validation
    - **Property 19: Hugo project structure validation**
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 4.5 Write property test for validation error messages
    - **Property 20: Validation error messages are specific**
    - **Validates: Requirements 8.4**

  - [ ]* 4.6 Write property test for invalid credentials rejection
    - **Property 21: Invalid credentials are rejected**
    - **Validates: Requirements 8.5**

- [ ] 5. Update ConfigService for multi-blog storage
  - [ ] 5.1 Extend AppConfig interface with blogs field
    - Add `blogs` field with profiles array and activeBlogId
    - Maintain legacy fields for backward compatibility
    - _Requirements: 1.1, 9.5_

  - [ ] 5.2 Implement profile persistence methods
    - Implement `saveProfiles()` method
    - Implement `loadProfiles()` method
    - Implement `saveActiveBlog()` method
    - Implement `loadActiveBlog()` method
    - _Requirements: 1.1, 2.5_

  - [ ]* 5.3 Write property test for profile updates persistence
    - **Property 5: Profile updates are persisted**
    - **Validates: Requirements 1.6**


- [ ] 6. Implement backward compatibility migration
  - [x] 6.1 Implement `migrateFromSingleBlog()` method
    - Detect old configuration format (hugoProjectPath field)
    - Create default profile from existing settings
    - Preserve Cloudflare configuration
    - Set migrated profile as active
    - Save new configuration format
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 6.2 Add migration check on ConfigService initialization
    - Check if blogs field exists in config
    - If not, check for legacy hugoProjectPath field
    - Trigger migration if old format detected
    - _Requirements: 9.1_

  - [ ]* 6.3 Write property test for configuration migration
    - **Property 23: Configuration migration preserves data**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 7. Update service classes with reconfiguration methods
  - [x] 7.1 Add `updateHugoProjectPath()` to ArticleService
    - Update internal hugoProjectPath and contentPostsPath
    - Clear cached article data
    - Reload articles from new Hugo project
    - _Requirements: 3.1, 4.1_

  - [x] 7.2 Add `updateHugoProjectPath()` to ImageService
    - Update internal hugoProjectPath and images path
    - Clear cached image data
    - Reload images from new Hugo project
    - _Requirements: 3.2, 4.2_

  - [x] 7.3 Add `updateHugoProjectPath()` to HugoService
    - Update internal hugoProjectPath
    - Stop any running preview server
    - _Requirements: 3.3_

  - [x] 7.4 Add `updateConfig()` to DeployService
    - Update Cloudflare configuration
    - Update Hugo project path
    - Validate new credentials
    - _Requirements: 3.4, 6.3_

  - [x] 7.5 Add `updateHugoProjectPath()` to StyleService
    - Update internal hugoProjectPath
    - Clear cached style data
    - _Requirements: 3.5_

  - [ ]* 7.6 Write property test for article isolation
    - **Property 9: Article isolation between blogs**
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 7.7 Write property test for image isolation
    - **Property 10: Image isolation between blogs**
    - **Validates: Requirements 4.2**

  - [ ]* 7.8 Write property test for tag isolation
    - **Property 11: Tag isolation between blogs**
    - **Validates: Requirements 4.4**

  - [ ]* 7.9 Write property test for category isolation
    - **Property 12: Category isolation between blogs**
    - **Validates: Requirements 4.5**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Implement IPC handlers for blog management
  - [x] 9.1 Create blog-handlers.ts file
    - Implement `blog:list-profiles` handler
    - Implement `blog:get-active` handler
    - Implement `blog:switch` handler
    - Implement `blog:create-profile` handler
    - Implement `blog:update-profile` handler
    - Implement `blog:delete-profile` handler
    - Implement `blog:validate-path` handler
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 2.2, 8.1_

  - [x] 9.2 Register blog handlers in main process
    - Import and call registerBlogHandlers in main/index.ts
    - Pass BlogManager instance to handlers
    - _Requirements: 1.1_

- [ ] 10. Implement profile import/export functionality
  - [x] 10.1 Implement `exportProfile()` method
    - Serialize profile to JSON
    - Exclude sensitive data by default (API tokens)
    - Support includeSensitive flag for full export
    - _Requirements: 10.1, 10.2_

  - [x] 10.2 Implement `importProfile()` method
    - Parse and validate JSON structure
    - Check for duplicate profile names
    - Validate Hugo project path
    - Prompt for path if not found
    - Create profile from imported data
    - _Requirements: 10.3, 10.4, 10.5, 10.6_

  - [ ] 10.3 Add IPC handlers for import/export
    - Implement `blog:export-profile` handler
    - Implement `blog:import-profile` handler
    - _Requirements: 10.1, 10.3_

  - [ ]* 10.4 Write property test for export/import round-trip
    - **Property 24: Profile export/import round-trip**
    - **Validates: Requirements 10.1, 10.3**

  - [ ]* 10.5 Write property test for export excludes sensitive data
    - **Property 25: Export excludes sensitive data by default**
    - **Validates: Requirements 10.2**

  - [ ]* 10.6 Write property test for import validation
    - **Property 26: Import validates profile structure**
    - **Validates: Requirements 10.4**

  - [ ]* 10.7 Write property test for import duplicate rejection
    - **Property 27: Import rejects duplicate names**
    - **Validates: Requirements 10.6**

- [ ] 11. Implement Hugo project initialization
  - [x] 11.1 Implement `initializeHugoProject()` method
    - Execute Hugo new site command
    - Create required directory structure
    - Generate default hugo.toml configuration
    - Configure shared theme library reference
    - Handle initialization failures with cleanup
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ] 11.2 Add IPC handler for Hugo initialization
    - Implement `blog:initialize-hugo` handler
    - _Requirements: 11.1_

  - [ ]* 11.3 Write property test for Hugo initialization structure
    - **Property 28: Hugo initialization creates required structure**
    - **Validates: Requirements 11.3, 11.5**

  - [ ]* 11.4 Write property test for shared theme configuration
    - **Property 29: Initialized project references shared themes**
    - **Validates: Requirements 11.4**

  - [ ]* 11.5 Write property test for initialization cleanup on failure
    - **Property 30: Failed initialization cleans up**
    - **Validates: Requirements 11.6**


- [ ] 12. Implement shared theme library support
  - [ ] 12.1 Update ThemeService for shared theme location
    - Configure shared theme library path
    - Ensure themes accessible to all blogs
    - _Requirements: 5.1, 5.2_

  - [ ] 12.2 Update Hugo project configuration for shared themes
    - Modify hugo.toml generation to reference shared themes
    - Support both shared themes and blog-specific customizations
    - _Requirements: 5.2, 5.5_

  - [ ]* 12.3 Write property test for shared theme library configuration
    - **Property 13: Shared theme library configuration**
    - **Validates: Requirements 5.2**

  - [ ]* 12.4 Write property test for theme application independence
    - **Property 14: Theme application independence**
    - **Validates: Requirements 5.3**

  - [ ]* 12.5 Write property test for blog-specific customizations isolation
    - **Property 15: Blog-specific customizations are isolated**
    - **Validates: Requirements 5.5**

- [ ] 13. Implement deployment profile isolation
  - [ ] 13.1 Update DeployService to use active blog's credentials
    - Ensure deployment uses current blog's Cloudflare config
    - Validate credentials before deployment
    - _Requirements: 6.3, 6.5_

  - [ ]* 13.2 Write property test for deployment profile isolation
    - **Property 16: Deployment profile isolation**
    - **Validates: Requirements 6.1, 6.2, 6.6**

  - [ ]* 13.3 Write property test for deployment uses active blog credentials
    - **Property 17: Deployment uses active blog's credentials**
    - **Validates: Requirements 6.3**

  - [ ]* 13.4 Write property test for deployment credentials validation
    - **Property 18: Deployment credentials are validated on switch**
    - **Validates: Requirements 6.5**

- [ ] 14. Create BlogSwitcher UI component
  - [x] 14.1 Create BlogSwitcher React component
    - Display active blog name prominently
    - Show dropdown with all blog profiles
    - Display profile icons/colors if available
    - Support keyboard shortcuts
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 12.3_

  - [x] 14.2 Add blog switcher to application toolbar
    - Integrate BlogSwitcher into main toolbar
    - Position prominently for easy access
    - _Requirements: 7.1_

  - [x] 14.3 Implement profile creation dialog
    - Create form with fields for name, path, Cloudflare config
    - Add validation feedback
    - Support Hugo project initialization option
    - _Requirements: 7.4, 7.5_

  - [x] 14.4 Implement profile edit dialog
    - Load existing profile data
    - Allow editing all profile fields
    - Validate changes before saving
    - _Requirements: 7.4_

  - [x] 14.5 Add profile delete confirmation
    - Show confirmation dialog with warning
    - Clarify that Hugo files will not be deleted
    - _Requirements: 7.4_


- [ ] 15. Implement profile metadata features
  - [ ] 15.1 Add optional metadata fields to profile UI
    - Add description field to profile forms
    - Add icon/color picker for visual identification
    - _Requirements: 12.1, 12.2_

  - [ ] 15.2 Implement profile ordering functionality
    - Support custom drag-and-drop ordering in switcher
    - Default to last accessed date sorting
    - Persist custom ordering in config
    - _Requirements: 12.4, 12.6_

  - [ ] 15.3 Update lastAccessedAt on blog switch
    - Automatically update timestamp when switching blogs
    - _Requirements: 12.5_

  - [ ]* 15.4 Write property test for optional metadata preservation
    - **Property 31: Optional metadata fields are preserved**
    - **Validates: Requirements 12.1, 12.2**

  - [ ]* 15.5 Write property test for custom ordering persistence
    - **Property 32: Custom profile ordering is preserved**
    - **Validates: Requirements 12.4**

  - [ ]* 15.6 Write property test for last accessed date update
    - **Property 33: Last accessed date is updated on switch**
    - **Validates: Requirements 12.5**

  - [ ]* 15.7 Write property test for default sorting
    - **Property 34: Default sorting by last accessed**
    - **Validates: Requirements 12.6**

- [ ] 16. Implement invalid profile handling
  - [ ] 16.1 Add profile validation on startup
    - Check all profiles for validity on app start
    - Mark invalid profiles as unavailable
    - Display warnings for invalid profiles
    - _Requirements: 8.6_

  - [ ] 16.2 Prevent switching to invalid profiles
    - Block switch attempts to invalid profiles
    - Show specific error message explaining why profile is invalid
    - _Requirements: 8.6_

  - [ ]* 16.3 Write property test for invalid profile marking
    - **Property 22: Invalid profiles are marked unavailable**
    - **Validates: Requirements 8.6**

- [ ] 17. Update main process initialization
  - [x] 17.1 Initialize BlogManager in main process
    - Create BlogManager instance with ConfigService and services
    - Load profiles on startup
    - Restore last active blog
    - Trigger migration if needed
    - _Requirements: 2.6, 9.1_

  - [x] 17.2 Update service initialization to use BlogManager
    - Initialize services with active blog's Hugo project path
    - Handle case when no blog is active (first run)
    - _Requirements: 2.6_

- [ ] 18. Add preload API for blog management
  - [x] 18.1 Extend preload script with blog APIs
    - Expose blog:list-profiles IPC call
    - Expose blog:get-active IPC call
    - Expose blog:switch IPC call
    - Expose blog:create-profile IPC call
    - Expose blog:update-profile IPC call
    - Expose blog:delete-profile IPC call
    - Expose blog:validate-path IPC call
    - Expose blog:export-profile IPC call
    - Expose blog:import-profile IPC call
    - Expose blog:initialize-hugo IPC call
    - _Requirements: 1.1, 2.2, 10.1, 10.3, 11.1_


- [ ] 19. Implement single-blog UI optimization
  - [ ] 19.1 Hide multi-blog UI when only one profile exists
    - Detect when user has only one blog profile
    - Hide blog switcher dropdown when single blog
    - Show simple blog name display instead
    - _Requirements: 9.6_

- [ ] 20. Add error handling and logging
  - [ ] 20.1 Implement comprehensive error handling
    - Add try-catch blocks in all BlogManager methods
    - Provide user-friendly error messages
    - Log detailed error information for debugging
    - Implement rollback on failed operations
    - _Requirements: 3.6_

  - [ ] 20.2 Add error handling for service reconfiguration
    - Catch and handle service update failures
    - Rollback to previous blog on failure
    - Display specific error messages to user
    - _Requirements: 3.6_

- [ ] 21. Integration and wiring
  - [ ] 21.1 Wire BlogManager to all services
    - Connect BlogManager to ArticleService
    - Connect BlogManager to ImageService
    - Connect BlogManager to HugoService
    - Connect BlogManager to DeployService
    - Connect BlogManager to StyleService
    - Test end-to-end blog switching flow
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 21.2 Wire BlogSwitcher to BlogManager
    - Connect UI component to IPC handlers
    - Test profile creation flow
    - Test profile editing flow
    - Test profile deletion flow
    - Test blog switching flow
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 21.3 Write integration tests for end-to-end flows
    - Test complete blog switching workflow
    - Test profile creation with Hugo initialization
    - Test migration from single-blog to multi-blog
    - Test import/export workflow

- [ ] 22. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript for the Electron application
- Services are reconfigured dynamically when switching blogs rather than running multiple instances
- Backward compatibility ensures existing single-blog users can upgrade seamlessly
