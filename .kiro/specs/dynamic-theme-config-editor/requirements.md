# Requirements Document

## Introduction

This feature enables the ConfigEditor component to dynamically display theme-specific configuration options based on the currently active Hugo theme. Currently, the ConfigEditor is hardcoded to show PaperMod theme parameters. When users switch themes, the configuration editor should automatically adapt to show the configuration options specific to the newly selected theme (e.g., background images, profile photos, posts-per-page settings).

## Glossary

- **ConfigEditor**: The React component responsible for rendering the configuration form UI
- **ThemeService**: The backend service that manages theme operations and parses theme configuration files
- **Theme_Config**: The configuration schema for a specific Hugo theme, including recommended parameters
- **Hugo_Config**: The main Hugo site configuration stored in hugo.toml/hugo.yaml
- **Recommended_Params**: Theme-specific configuration parameters defined in the theme's example configuration
- **Active_Theme**: The currently selected Hugo theme for the blog site
- **Config_Schema**: The structure defining available configuration fields for a theme

## Requirements

### Requirement 1: Fetch Active Theme Configuration

**User Story:** As a user, I want the configuration editor to automatically load the active theme's configuration schema, so that I see relevant configuration options for my current theme.

#### Acceptance Criteria

1. WHEN the ConfigEditor component mounts, THE ConfigEditor SHALL fetch the active theme name from ThemeService
2. WHEN the active theme name is retrieved, THE ConfigEditor SHALL fetch the Theme_Config for that theme
3. IF the Theme_Config fetch fails, THEN THE ConfigEditor SHALL display an error message and fall back to basic Hugo configuration fields
4. THE ConfigEditor SHALL store the fetched Theme_Config in component state

### Requirement 2: Render Dynamic Configuration Fields

**User Story:** As a user, I want to see configuration fields that match my theme's capabilities, so that I can configure theme-specific features like background images or profile photos.

#### Acceptance Criteria

1. WHEN Theme_Config contains Recommended_Params, THE ConfigEditor SHALL render form fields for each parameter
2. THE ConfigEditor SHALL infer field types from parameter values (string → text input, boolean → select, number → number input, array → dynamic list)
3. THE ConfigEditor SHALL display parameter names as field labels with proper formatting (camelCase → Title Case)
4. WHERE a parameter value is an object, THE ConfigEditor SHALL render nested fields for object properties
5. WHERE a parameter value is an array, THE ConfigEditor SHALL render a dynamic list with add/remove controls

### Requirement 3: Preserve Common Configuration Fields

**User Story:** As a user, I want to always see basic site configuration options regardless of theme, so that I can manage fundamental settings like site title and language.

#### Acceptance Criteria

1. THE ConfigEditor SHALL always render the "Site Basic Information" section with title, description, author, and language fields
2. THE ConfigEditor SHALL always render the "Navigation Menu" section
3. WHEN rendering theme-specific sections, THE ConfigEditor SHALL place them after common sections
4. THE ConfigEditor SHALL maintain existing functionality for menu and social icon management

### Requirement 4: Handle Theme Configuration Updates

**User Story:** As a user, I want my configuration changes to be saved to the correct Hugo configuration structure, so that my theme displays correctly with my chosen settings.

#### Acceptance Criteria

1. WHEN a user modifies a theme-specific field, THE ConfigEditor SHALL update the Hugo_Config params object
2. THE ConfigEditor SHALL preserve the parameter structure expected by the theme (nested objects, arrays, etc.)
3. WHEN the onChange callback is invoked, THE ConfigEditor SHALL pass the complete updated Hugo_Config
4. THE ConfigEditor SHALL validate that required theme parameters are not empty before saving

### Requirement 5: React to Theme Switch Events

**User Story:** As a user, I want the configuration editor to automatically update when I switch themes, so that I immediately see the new theme's configuration options.

#### Acceptance Criteria

1. WHEN the active theme changes, THE ConfigEditor SHALL detect the theme change event
2. WHEN a theme change is detected, THE ConfigEditor SHALL fetch the new Theme_Config
3. WHEN the new Theme_Config is loaded, THE ConfigEditor SHALL re-render with the new theme's configuration fields
4. THE ConfigEditor SHALL preserve common configuration values (title, description, author, language, menu) across theme switches

### Requirement 6: Display Theme-Specific Help Text

**User Story:** As a user, I want to see helpful descriptions for theme-specific configuration options, so that I understand what each setting does.

#### Acceptance Criteria

1. WHERE Theme_Config includes parameter descriptions, THE ConfigEditor SHALL display them as help text below fields
2. WHERE no description is available, THE ConfigEditor SHALL display the parameter name as a label without additional help text
3. THE ConfigEditor SHALL format help text in a visually distinct style (smaller font, muted color)
4. WHERE a parameter has validation rules, THE ConfigEditor SHALL display validation hints in the help text

### Requirement 7: Handle Missing Theme Configuration

**User Story:** As a developer, I want the system to gracefully handle themes without configuration files, so that the application doesn't crash when using minimal themes.

#### Acceptance Criteria

1. IF ThemeService returns null for Theme_Config, THEN THE ConfigEditor SHALL display only common configuration sections
2. IF ThemeService returns an empty Recommended_Params object, THEN THE ConfigEditor SHALL display only common configuration sections
3. THE ConfigEditor SHALL log a warning message when Theme_Config is unavailable
4. THE ConfigEditor SHALL display an informational message indicating that the theme has no specific configuration options

### Requirement 8: Support Multiple Configuration Value Types

**User Story:** As a user, I want to configure different types of theme settings (text, numbers, toggles, lists), so that I can fully customize my theme's appearance and behavior.

#### Acceptance Criteria

1. WHEN a parameter value is a string, THE ConfigEditor SHALL render a text input field
2. WHEN a parameter value is a boolean, THE ConfigEditor SHALL render a select dropdown with "Yes/No" options
3. WHEN a parameter value is a number, THE ConfigEditor SHALL render a number input field
4. WHEN a parameter value is an array of strings, THE ConfigEditor SHALL render a dynamic list with add/remove buttons
5. WHEN a parameter value is an array of objects, THE ConfigEditor SHALL render a card-based list with nested fields for each object property

### Requirement 9: Maintain Backward Compatibility

**User Story:** As an existing user with PaperMod theme, I want my current configuration workflow to continue working, so that the update doesn't disrupt my existing setup.

#### Acceptance Criteria

1. WHEN the active theme is PaperMod, THE ConfigEditor SHALL render all previously available PaperMod-specific fields
2. THE ConfigEditor SHALL maintain the same field names and structure for PaperMod configuration
3. THE ConfigEditor SHALL preserve existing validation logic for PaperMod fields
4. THE ConfigEditor SHALL maintain the same onChange callback signature and behavior

### Requirement 10: Parse Theme Configuration Schema

**User Story:** As a developer, I want ThemeService to extract configuration schema from theme files, so that ConfigEditor can render appropriate fields.

#### Acceptance Criteria

1. THE ThemeService SHALL parse Recommended_Params from theme configuration files (theme.toml, exampleSite/config.toml, exampleSite/hugo.yaml)
2. THE ThemeService SHALL return parameter names, types, and default values in the Theme_Config object
3. WHERE available, THE ThemeService SHALL extract parameter descriptions from configuration comments
4. THE ThemeService SHALL handle both TOML and YAML configuration formats
5. IF parsing fails, THEN THE ThemeService SHALL return null and log the error

