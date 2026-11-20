# Shared form component guide

Use `AppSelect` for short static choices, `AppCombobox` for searchable single selection, and `AppMultiSelect` for searchable multiple selection. Remote option loaders belong at the screen boundary; pass loading, error, retry, and debounced search state into the shared control.

Use `ImagePicker` for raster images that need preview or cropping. Choose the semantic preset (`avatar`, `logo`, `banner`, `product`, or `signature`) rather than supplying ad-hoc dimensions. Use `FileDropzone` for PDFs, spreadsheets, and other governed files.

Use `LocationSelector` in editors and `LocationPreviewMap` in full detail views. Tables and directory cards should display concise location text. Legacy addresses without coordinates may use the preview component's external map-search fallback; never invent coordinates during render.

All shared fields must receive a visible label, controlled value, disabled/loading state, and actionable error text. Direct file inputs and new native selects are prohibited outside the shared primitives or an explicitly documented compatibility exception.
