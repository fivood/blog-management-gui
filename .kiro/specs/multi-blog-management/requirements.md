# Requirements Document

## Introduction

This document specifies requirements for the Multi-Blog Management feature, which enables users to manage multiple independent Hugo-based blogs within a single application instance. Each blog corresponds to a separate Hugo project with its own articles, tags, categories, configuration, and Cloudflare deployment settings, while sharing common theme templates.

## Glossary

- **Blog_Manager**: The system component responsible for managing multiple blog configurations
- **Blog_Profile**: A configuration entity containing Hugo project path, Cloudflare settings, and metadata for a single blog
- **Active_Blog**: The currently selected blog that all operations apply to
- **Blog_Switcher**: UI component that allows users to switch between different blogs
- **Service_Layer**: Collection of services (ArticleService, ImageService, HugoService, DeployService, StyleService) that operate on blog content
- **Config_Service**: Service responsible for persisting application and blog configurations
- **Hugo_Project**: A directory containing Hugo site structure (content, themes, config, static, public)
- **Theme_Library**: Shared collection of Hugo themes available to all blogs
- **Deployment_Profile**: Cloudflare Pages configuration specific to one blog

## Requirements

### Requirement 1: Blog Profile Management

**User Story:** As a blog author, I want to create and manage multiple blog profiles, so that I can maintain separate blogs for different purposes or domains.

#### Acceptance Criteria

1. THE Blog_Manager SHALL store a list of Blog_Profiles in Config_Service
2. WHEN a user creates a new Blog_Profile, THE Blog_Manager SHALL validate that the Hugo_Project path exists
3. WHEN a user creates a new Blog_Profile, THE Blog_Manager SHALL require a unique profile name
4. THE Blog_Manager SHALL store Hugo_Project path, profile name, display name, and Deployment_Profile for each Blog_Profile
5. WHEN a user deletes a Blog_Profile, THE Blog_Manager SHALL remove it from the configuration without deleting the Hugo_Project files
6. THE Blog_Manager SHALL support editing Blog_Profile metadata (name, Hugo_Project path, Deployment_Profile)

### Requirement 2: Blog Switching

**User Story:** As a blog author, I want to switch between different blogs, so that I can work on different projects without restarting the application.

#### Acceptance Criteria

1. THE Blog_Switcher SHALL display all available Blog_Profiles with their display names
2. WHEN a user selects a Blog_Profile, THE Blog_Manager SHALL set it as the Active_Blog
3. WHEN the Active_Blog changes, THE Service_Layer SHALL reload all data from the new Hugo_Project path
4. WHEN the Active_Blog changes, THE Blog_Switcher SHALL update the UI to indicate the current Active_Blog
5. THE Config_Service SHALL persist the last Active_Blog selection
6. WHEN the application starts, THE Blog_Manager SHALL restore the last Active_Blog

### Requirement 3: Service Layer Reconfiguration

**User Story:** As a developer, I want the service layer to dynamically reconfigure when switching blogs, so that all operations target the correct Hugo project.

#### Acceptance Criteria

1. WHEN the Active_Blog changes, THE ArticleService SHALL update its Hugo_Project path and reload articles
2. WHEN the Active_Blog changes, THE ImageService SHALL update its Hugo_Project path and reload images
3. WHEN the Active_Blog changes, THE HugoService SHALL update its Hugo_Project path
4. WHEN the Active_Blog changes, THE DeployService SHALL update its Hugo_Project path and Deployment_Profile
5. WHEN the Active_Blog changes, THE StyleService SHALL update its Hugo_Project path
6. WHEN service reconfiguration fails, THE Blog_Manager SHALL display an error and revert to the previous Active_Blog

### Requirement 4: Independent Blog Content

**User Story:** As a blog author, I want each blog to have completely separate content, so that articles and images from one blog don't appear in another.

#### Acceptance Criteria

1. THE ArticleService SHALL load articles only from the Active_Blog's Hugo_Project path
2. THE ImageService SHALL load images only from the Active_Blog's Hugo_Project path
3. WHEN listing articles, THE ArticleService SHALL return only articles from the Active_Blog
4. WHEN listing tags, THE ArticleService SHALL return only tags from the Active_Blog
5. WHEN listing categories, THE ArticleService SHALL return only categories from the Active_Blog
6. THE Blog_Manager SHALL ensure no data leakage between different Blog_Profiles

### Requirement 5: Shared Theme Library

**User Story:** As a blog author, I want to use the same themes across different blogs, so that I can maintain consistent styling without duplicating theme files.

#### Acceptance Criteria

1. THE Theme_Library SHALL be stored in a shared location accessible to all Blog_Profiles
2. WHEN a Hugo_Project is created, THE Blog_Manager SHALL configure it to reference the shared Theme_Library
3. THE ThemeService SHALL apply themes from the Theme_Library to any Active_Blog
4. WHEN a theme is updated in the Theme_Library, THE Blog_Manager SHALL make it available to all Blog_Profiles
5. THE Blog_Manager SHALL support both shared themes and blog-specific theme customizations

### Requirement 6: Independent Deployment Configuration

**User Story:** As a blog author, I want each blog to deploy to its own Cloudflare Pages project, so that different blogs can be published to different domains.

#### Acceptance Criteria

1. THE Blog_Profile SHALL store a separate Deployment_Profile for each blog
2. THE Deployment_Profile SHALL include Cloudflare API token, account ID, and project name
3. WHEN deploying, THE DeployService SHALL use the Active_Blog's Deployment_Profile
4. THE Config_Service SHALL encrypt and store all Deployment_Profiles securely
5. WHEN switching blogs, THE DeployService SHALL validate the new Deployment_Profile credentials
6. THE Blog_Manager SHALL allow different blogs to use different Cloudflare accounts

### Requirement 7: Blog Profile UI

**User Story:** As a blog author, I want an intuitive interface to manage blog profiles, so that I can easily add, edit, and switch between blogs.

#### Acceptance Criteria

1. THE Blog_Switcher SHALL be accessible from the main application toolbar
2. THE Blog_Switcher SHALL display the Active_Blog name prominently
3. WHEN a user clicks the Blog_Switcher, THE system SHALL show a dropdown with all Blog_Profiles
4. THE Blog_Switcher SHALL provide options to create, edit, and delete Blog_Profiles
5. WHEN creating a Blog_Profile, THE system SHALL provide a form with fields for name, Hugo_Project path, and Deployment_Profile
6. THE Blog_Switcher SHALL support keyboard shortcuts for switching between blogs

### Requirement 8: Blog Profile Validation

**User Story:** As a blog author, I want the system to validate blog configurations, so that I can identify and fix configuration errors before they cause problems.

#### Acceptance Criteria

1. WHEN adding a Blog_Profile, THE Blog_Manager SHALL verify the Hugo_Project path exists
2. WHEN adding a Blog_Profile, THE Blog_Manager SHALL verify the Hugo_Project contains required directories (content, themes, static)
3. WHEN adding a Blog_Profile, THE Blog_Manager SHALL verify the hugo.toml or hugo.yaml configuration file exists
4. IF validation fails, THE Blog_Manager SHALL display specific error messages indicating what is missing
5. THE Blog_Manager SHALL validate Deployment_Profile credentials before saving
6. WHEN a Blog_Profile becomes invalid, THE Blog_Manager SHALL mark it as unavailable and display a warning

### Requirement 9: Backward Compatibility

**User Story:** As an existing user, I want my current blog configuration to work seamlessly, so that I don't lose access to my existing content when upgrading.

#### Acceptance Criteria

1. WHEN the application starts with an old configuration, THE Blog_Manager SHALL automatically migrate it to a Blog_Profile
2. THE Blog_Manager SHALL create a default Blog_Profile using the existing hugoProjectPath from Config_Service
3. THE Blog_Manager SHALL preserve all existing Cloudflare configuration in the migrated Blog_Profile
4. WHEN migration completes, THE Blog_Manager SHALL set the migrated profile as the Active_Blog
5. THE Blog_Manager SHALL maintain the existing configuration file format for single-blog users
6. WHEN a user has only one Blog_Profile, THE Blog_Switcher SHALL hide multi-blog UI elements

### Requirement 10: Blog Profile Import/Export

**User Story:** As a blog author, I want to export and import blog profiles, so that I can share configurations or move them between machines.

#### Acceptance Criteria

1. THE Blog_Manager SHALL support exporting a Blog_Profile to a JSON file
2. WHEN exporting, THE Blog_Manager SHALL exclude sensitive data (API tokens) unless explicitly requested
3. THE Blog_Manager SHALL support importing a Blog_Profile from a JSON file
4. WHEN importing, THE Blog_Manager SHALL validate the profile structure and Hugo_Project path
5. IF the Hugo_Project path doesn't exist during import, THE Blog_Manager SHALL prompt the user to select a new path
6. THE Blog_Manager SHALL prevent importing duplicate Blog_Profile names

### Requirement 11: Hugo Project Initialization

**User Story:** As a blog author, I want to create a new Hugo project from within the application, so that I can quickly set up a new blog without using command-line tools.

#### Acceptance Criteria

1. THE Blog_Manager SHALL provide an option to create a new Hugo_Project when adding a Blog_Profile
2. WHEN creating a new Hugo_Project, THE Blog_Manager SHALL prompt for a directory location
3. THE Blog_Manager SHALL execute Hugo initialization commands to create the project structure
4. WHEN initialization completes, THE Blog_Manager SHALL configure the project to use the shared Theme_Library
5. THE Blog_Manager SHALL create a default hugo.toml configuration file with basic settings
6. IF Hugo initialization fails, THE Blog_Manager SHALL display an error and clean up partial files

### Requirement 12: Blog Profile Metadata

**User Story:** As a blog author, I want to add descriptive metadata to blog profiles, so that I can easily identify and organize multiple blogs.

#### Acceptance Criteria

1. THE Blog_Profile SHALL support optional description field
2. THE Blog_Profile SHALL support optional icon or color identifier
3. THE Blog_Switcher SHALL display Blog_Profile icons or colors in the dropdown
4. THE Blog_Manager SHALL support custom ordering of Blog_Profiles in the switcher
5. THE Blog_Profile SHALL store creation date and last accessed date
6. THE Blog_Switcher SHALL sort profiles by last accessed date by default

