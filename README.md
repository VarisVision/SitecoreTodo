# Introduction

Page To Do adds a shared checklist in Sitecore XM Cloud's Page Builder. Content editors and developers can track tasks visible across all pages. It keeps work items in context while editing pages and reduces the need to switch to external tools.

## Features and Benefits

- **Shared checklist displayed across all pages** in Sitecore Page Builder for consistent task visibility
- **Create, edit, delete, and mark tasks complete** directly in the Page Builder without external tools
- **Customize checklist title and edit tasks inline**
# Getting Started

## Installation Process

Access the app from Sitecore Marketplace in XM Cloud. After installing, open Page Builder and launch the app.

On first use, the app automatically detects if the module isn't installed and prompts you to click the "Install Module" button to create the required Sitecore templates and data folders. Once complete, the shared checklist appears and you can start adding tasks immediately.

## Software Dependencies

This project requires:

- Node.js (version 20 or higher recommended)
- npm or yarn package manager
- Sitecore XM Cloud with Page Builder access

### Installing Dependencies

```bash
npm install
```

## Latest Releases

Check the [Sitecore Marketplace](https://marketplace.sitecore.com) for the latest version of Page To Do.

## API References

This project uses the [Sitecore Marketplace SDK](https://www.npmjs.com/package/@sitecore-marketplace-sdk/client) for integration with Sitecore XM Cloud.

# Build and Test

## Building the Project

To build the project for production:

```bash
npm run build
```

## Running in Development Mode

To run the project in development mode with hot reload:

```bash
npm run dev
```

## Type Checking

To check TypeScript types without building:

```bash
npm run type-check
```

## Linting

To check code quality:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```