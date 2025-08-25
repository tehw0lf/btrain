# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

btrain is a single-purpose Angular application that retrieves claimable $GAS amounts from $bNEO for Neo N3 wallet addresses. The app supports both standard N3 addresses (34 characters) and Neo domain names (.neo).

## Architecture

### Single Angular Application (Nx-based)
- **Framework**: Angular 20 with standalone components
- **Build System**: Nx monorepo structure (single project)
- **State Management**: Angular signals for reactive state
- **HTTP Client**: Angular HttpClient for Neo blockchain API calls

### Core Components
- **AppComponent** (`src/app/app.component.ts`): Main component with address input and gas display
- **NeofuraService** (`src/app/neofura.service.ts`): Service for Neo blockchain API interactions
- **Util functions** (`src/app/util.ts`): Address-to-scripthash conversion utilities

### Key Dependencies
- **bs58check**: Base58 encoding/decoding for Neo addresses
- **buffer**: Buffer polyfill for browser environment
- **rxjs**: Reactive programming with observables

## Development Commands

### Primary Development Tasks
```bash
# Start development server
npm start
# or
nx serve

# Build for production
npm run build
# or
nx build

# Run tests
npm run test
# or  
nx test

# Run linting
nx lint
```

### Additional Commands
```bash
# Serve built application statically
nx serve-static

# Extract i18n messages
nx extract-i18n

# Test with CI configuration (coverage enabled)
nx test --configuration=ci
```

## Project Configuration

### Build Configuration
- **Output Path**: `dist/btrain/browser/`
- **Bundle Budgets**: 500KB warning, 1MB error for initial bundle
- **Component Style Budget**: 4KB warning, 8KB error
- **Default Configuration**: Production build with optimization enabled

### Code Standards
- **Component Prefix**: `app-` for components
- **Directive Prefix**: `app` (camelCase) for directives  
- **Selector Style**: kebab-case for component selectors
- **ESLint**: Nx flat config with Angular-specific rules
- **Testing**: Jest with Angular preset

## Blockchain Integration

### Neo N3 API Integration
- **Primary API**: Neofura (https://neofura.ngd.network/)
- **Contract Address**: `0x48c40d4666f93408be1bef038b6722404d9a4c2a` (bNEO contract)
- **Neo NS Contract**: `0x50ac1c37690cc2cfc594472833cf57505d5f46de` (domain resolution)

### Address Processing
- Supports 34-character Neo N3 addresses
- Supports .neo domain name resolution
- Uses Base58Check decoding with SHA-256 double hashing
- Converts addresses to little-endian script hash format for API calls

### API Response Handling
- Gas amounts returned in integer format (divide by 100000000 for decimal)
- Async address resolution with fallback to Neo NS for .neo domains
- Error handling for invalid addresses and API failures

## Containerization

### Docker Configuration
- **Base Image**: nginx:alpine
- **Build Output**: Served from `/usr/share/nginx/html`
- **Config**: Custom nginx.conf for SPA routing support

### Production Deployment
```bash
# Build and containerize
npm run build
docker build -t btrain .
```

## Testing Strategy

### Unit Testing
- Jest with Angular testing utilities
- Setup file: `src/test-setup.ts`
- Coverage output: `coverage/btrain/`
- Snapshot serializers for Angular components

### Test Execution
```bash
# Run all tests
nx test

# Run tests with coverage
nx test --configuration=ci

# Run specific test patterns
nx test --testNamePattern="component"
```

## Architecture Patterns

### Signal-Based Reactivity
- Uses Angular signals for state management
- Computed signals for derived state (loading, masked addresses)
- Effect-based side effects for address validation and API calls

### Service Architecture
- Injectable services with `providedIn: 'root'`
- Signal-based state within services
- Async/await patterns combined with RxJS observables
- Error boundary handling with fallback mechanisms

### Crypto Utilities
- Web Crypto API for SHA-256 hashing
- Custom Base58Check implementation
- Little-endian byte order handling for Neo blockchain compatibility