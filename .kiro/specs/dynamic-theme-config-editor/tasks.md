# Implementation Plan: Dynamic Theme Config Editor

## Overview

This implementation transforms the ConfigEditor component from a hardcoded PaperMod-specific form into a dynamic, theme-aware configuration editor. The system will automatically detect the active Hugo theme and render appropriate configuration fields based on that theme's schema using a field type inference system.

The implementation follows a bottom-up approach: first enhancing the backend ThemeService to extract richer configuration data, then building utility functions and hooks for type inference and field generation, and finally refactoring the ConfigEditor component to use these new capabilities.

## Tasks

- [x] 1. Enhance ThemeService backend for richer configuration parsing
  - [x] 1.1 Add parameter description extraction to ThemeService
    - Implement `extractParameterDescriptions()` method that parses comments above parameter definitions in TOML/YAML files
    - Update `parseExampleConfig()` to call description extraction and populate `paramDescriptions` in ThemeConfig
    - Update `parseExampleYamlConfig()` to call description extraction and populate `paramDescriptions` in ThemeConfig
    - _Requirements: 10.3_
  
  - [x] 1.2 Enhance TOML parsing to support nested structures
    - Implement `extractTomlSections()` method to extract all [params.*] sections
    - Implement `parseTomlSection()` method to parse individual TOML sections with array and nested object support
    - Update `parseExampleConfig()` to use new section extraction for nested params (e.g., params.homeInfoParams)
    - _Requirements: 10.1, 10.2_
  
  - [x] 1.3 Enhance YAML parsing to support nested structures
    - Update `parseExampleYamlConfig()` to extract nested params structures
    - Ensure arrays of objects and nested objects are properly extracted
    - _Requirements: 10.1, 10.4_
  
  - [ ]* 1.4 Write unit tests for enhanced ThemeService parsing
    - Test description extraction from TOML comments
    - Test description extraction from YAML comments
    - Test nested TOML section parsing
    - Test nested YAML section parsing
    - Test array parsing (strings and objects)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Create type inference and field specification utilities
  - [x] 2.1 Implement field type inference function
    - Create `src/renderer/utils/fieldTypeInference.ts`
    - Implement `inferFieldType()` function with type detection rules (boolean, number, string, array, object, url, color, textarea)
    - Implement `inferFieldTypeSafely()` wrapper with error handling
    - _Requirements: 2.2, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 2.2 Write property test for type inference correctness
    - **Property 1: Type Inference Correctness**
    - **Validates: Requirements 2.2, 8.1, 8.2, 8.3, 8.4, 8.5**
    - Use fast-check to generate arbitrary parameter values of different types
    - Verify correct FieldType mapping for each type
    - _Requirements: 2.2, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 2.3 Implement label formatting utility
    - Create `formatLabel()` function in `src/renderer/utils/fieldTypeInference.ts`
    - Handle camelCase to Title Case conversion
    - Handle snake_case to Title Case conversion
    - Handle common abbreviations (URL, HTML, CSS, SEO, RSS, API)
    - _Requirements: 2.3_
  
  - [ ]* 2.4 Write property test for label formatting consistency
    - **Property 3: Label Formatting Consistency**
    - **Validates: Requirements 2.3**
    - Generate arbitrary camelCase and snake_case parameter names
    - Verify consistent Title Case output with abbreviation handling
    - _Requirements: 2.3_

- [x] 3. Create React hooks for theme configuration management
  - [x] 3.1 Implement useThemeConfig hook
    - Create `src/renderer/hooks/useThemeConfig.ts`
    - Implement theme config fetching with loading and error states
    - Add refetch capability
    - Add theme change event listener
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_
  
  - [x] 3.2 Implement useFieldSpecs hook
    - Create `src/renderer/hooks/useFieldSpecs.ts`
    - Generate FieldSpec array from ThemeConfig recommendedParams
    - Handle nested structures (objects and arrays)
    - Use memoization for performance
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [ ]* 3.3 Write unit tests for hooks
    - Test useThemeConfig loading states
    - Test useThemeConfig error handling
    - Test useThemeConfig theme change detection
    - Test useFieldSpecs field generation
    - Test useFieldSpecs nested structure handling
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5, 5.1, 5.2_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build dynamic field rendering components
  - [x] 5.1 Create DynamicFieldRenderer component
    - Create `src/renderer/components/styles/DynamicFieldRenderer.tsx`
    - Implement field rendering for all FieldType values (text, number, boolean, textarea, url, color, array-string, array-object, object)
    - Handle value changes and propagate to parent
    - _Requirements: 2.1, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 5.2 Create StringArrayEditor component
    - Create `src/renderer/components/styles/StringArrayEditor.tsx`
    - Implement add/remove functionality for string arrays
    - Handle empty arrays
    - _Requirements: 8.4_
  
  - [x] 5.3 Create ObjectArrayEditor component
    - Create `src/renderer/components/styles/ObjectArrayEditor.tsx`
    - Implement card-based list with nested fields
    - Implement add/remove functionality for object arrays
    - Use DynamicFieldRenderer for nested fields
    - _Requirements: 8.5_
  
  - [x] 5.4 Create ObjectEditor component
    - Create `src/renderer/components/styles/ObjectEditor.tsx`
    - Render nested fields for object properties
    - Use DynamicFieldRenderer for nested fields
    - _Requirements: 2.4_
  
  - [ ]* 5.5 Write unit tests for field rendering components
    - Test DynamicFieldRenderer for each field type
    - Test StringArrayEditor add/remove operations
    - Test ObjectArrayEditor add/remove operations
    - Test ObjectEditor nested field rendering
    - _Requirements: 2.1, 2.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Refactor ConfigEditor component for dynamic field generation
  - [x] 6.1 Add theme configuration state management to ConfigEditor
    - Import and use useThemeConfig hook
    - Import and use useFieldSpecs hook
    - Add loading and error state handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 6.2 Implement dynamic theme-specific section rendering
    - Add theme-specific configuration card after common sections
    - Render dynamic fields using DynamicFieldRenderer
    - Display parameter descriptions as help text
    - Handle empty/null theme configs gracefully
    - _Requirements: 2.1, 3.3, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2_
  
  - [x] 6.3 Implement theme parameter change handler
    - Create `handleThemeParamChange()` function
    - Update Hugo_Config params object while preserving structure
    - Invoke onChange callback with complete updated config
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 6.4 Add theme change event handling
    - Listen for 'theme:changed' IPC events
    - Preserve common configuration values during theme switch
    - Re-fetch theme config on theme change
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 6.5 Write unit tests for ConfigEditor refactoring
    - Test theme config loading on mount
    - Test error handling for failed theme config fetch
    - Test dynamic field rendering
    - Test theme parameter updates
    - Test theme change event handling
    - Test common section preservation
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement property-based tests for core correctness properties
  - [ ]* 8.1 Write property test for field generation completeness
    - **Property 2: Field Generation Completeness**
    - **Validates: Requirements 2.1, 2.4, 2.5**
    - Generate arbitrary ThemeConfig with recommendedParams
    - Verify exactly one field generated per parameter
    - Verify nested fields generated for objects and arrays
    - _Requirement
s: 2.1, 2.4, 2.5_
  
  - [ ]* 8.2 Write property test for common sections always present
    - **Property 4: Common Sections Always Present**
    - **Validates: Requirements 3.1, 3.2**
    - Generate arbitrary theme configs (including null/empty)
    - Verify "Site Basic Information" and "Navigation Menu" sections always rendered
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 8.3 Write property test for section ordering invariant
    - **Property 5: Section Ordering Invariant**
    - **Validates: Requirements 3.3**
    - Generate arbitrary theme configs with theme-specific params
    - Verify theme-specific sections appear after common sections
    - _Requirements: 3.3_
  
  - [ ]* 8.4 Write property test for state update completeness
    - **Property 7: State Update Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Generate arbitrary field modifications
    - Verify onChange called with complete Hugo_Config
    - Verify nested structures preserved
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 8.5 Write property test for common values preservation across theme switch
    - **Property 9: Common Values Preservation Across Theme Switch**
    - **Validates: Requirements 5.4**
    - Generate arbitrary theme switches with common config values
    - Verify title, description, author, language, menu preserved
    - _Requirements: 5.4_
  
  - [ ]* 8.6 Write property test for description display mapping
    - **Property 10: Description Display Mapping**
    - **Validates: Requirements 6.1, 6.2, 6.4**
    - Generate arbitrary theme configs with/without descriptions
    - Verify help text displayed when description exists
    - Verify only label displayed when description missing
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [ ]* 8.7 Write property test for ThemeService parsing round trip
    - **Property 11: ThemeService Parsing Round Trip**
    - **Validates: Requirements 10.1, 10.2, 10.4**
    - Generate arbitrary valid TOML/YAML config files
    - Parse with ThemeService
    - Verify all [params] parameters extracted with correct names, values, and types
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ]* 8.8 Write property test for comment extraction accuracy
    - **Property 12: Comment Extraction Accuracy**
    - **Validates: Requirements 10.3**
    - Generate arbitrary config files with comments preceding parameters
    - Parse with ThemeService
    - Verify comments mapped to correct parameter names in paramDescriptions
    - _Requirements: 10.3_

- [x] 9. Add validation and error handling
  - [x] 9.1 Implement required field validation
    - Add validation logic to ConfigEditor for required theme parameters
    - Display validation errors for empty required fields
    - Prevent saving when required fields are empty
    - _Requirements: 4.4_
  
  - [x] 9.2 Add error boundaries and graceful degradation
    - Wrap dynamic field rendering in error boundaries
    - Display fallback UI when field rendering fails
    - Log errors for debugging
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 9.3 Write unit tests for validation and error handling
    - Test required field validation
    - Test error boundary behavior
    - Test graceful degradation for missing theme config
    - _Requirements: 4.4, 7.1, 7.2, 7.3, 7.4_

- [x] 10. Ensure backward compatibility with PaperMod theme
  - [x] 10.1 Verify PaperMod configuration workflow
    - Test that all PaperMod-specific fields render correctly
    - Verify field names and structure match original implementation
    - Verify validation logic preserved
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 10.2 Write backward compatibility tests
    - Test PaperMod theme config loading
    - Test PaperMod field rendering
    - Test PaperMod configuration updates
    - Compare behavior with original implementation
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 11. Add IPC handler for theme change notifications
  - [x] 11.1 Implement theme:switched IPC handler
    - Add 'theme:switched' IPC handler in theme-handlers.ts
    - Broadcast 'theme:changed' event to all renderer windows
    - _Requirements: 5.1, 5.2_
  
  - [x] 11.2 Update ThemeSwitcher to emit theme:switched event
    - Modify ThemeSwitcher component to emit 'theme:switched' IPC event after successful theme switch
    - _Requirements: 5.1_
  
  - [ ]* 11.3 Write integration tests for theme change notifications
    - Test IPC event emission on theme switch
    - Test ConfigEditor receives theme change event
    - Test ConfigEditor re-fetches theme config on event
    - _Requirements: 5.1, 5.2_

- [x] 12. Final checkpoint - Integration testing and validation
  - [x] 12.1 Test complete workflow with multiple themes
    - Test ConfigEditor with PaperMod theme
    - Test ConfigEditor with a different theme (e.g., Neopost)
    - Test theme switching between different themes
    - Verify configuration persistence across theme switches
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3, 4.1, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 12.2 Ensure all tests pass
    - Run all unit tests
    - Run all property-based tests
    - Run all integration tests
    - Fix any failing tests
  
  - [x] 12.3 Final validation
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Implementation uses TypeScript with React and Electron
- The design uses existing Ant Design components for UI consistency
- Backend enhancements to ThemeService are foundational and must be completed first
- Utility functions and hooks provide reusable logic for field generation
- Component refactoring builds on utilities and hooks
- Property-based tests use fast-check library with minimum 100 iterations per test
