<div align="center">

# 🧠 ContextHub

### AI-Powered Developer Intelligence for Repository Exploration

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tambo AI](https://img.shields.io/badge/Tambo_AI-Integrated-FF6B6B?style=for-the-badge)](https://tambo.ai)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🚀 Overview

**ContextHub** is a context-aware developer UI that revolutionizes how developers explore and understand repositories. Built with React + Vite, it combines intelligent repository indexing with AI-powered insights to accelerate developer onboarding and productivity.

### ✨ Why ContextHub?

- 🔍 **Smart Exploration**: Navigate codebases with an interactive folder tree and intelligent search
- 🤖 **AI Assistant**: Ask natural language questions about your code with Tambo AI integration
- 📊 **Visual Insights**: Render interactive cards, charts, and visualizations for better understanding
- 🔄 **PR Analysis**: Deep-dive into pull requests and track file changes effortlessly
- ⚡ **Lightning Fast**: Built on Vite for instant hot module replacement and blazing performance

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 📁 Repository Intelligence
- Interactive folder tree navigation
- Syntax-highlighted file viewer
- File metadata (size, lines, language)
- Code pattern search
- Quick links to important files

</td>
<td width="50%">

### 🤖 AI-Powered Assistance
- Natural language code queries
- Context-aware responses
- Interactive UI cards
- Smart recommendations
- Programmable file operations

</td>
</tr>
<tr>
<td width="50%">

### 🔄 Pull Request Management
- List and filter PRs
- View changed files
- Detailed PR information
- Status tracking
- Review insights

</td>
<td width="50%">

### 🛠️ Developer Tools
- GitHub API integration
- Real-time repository indexing
- Customizable search patterns
- Code snippet extraction
- Automated workflows

</td>
</tr>
</table>

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ (LTS) | Runtime environment |
| **npm** | Latest | Package management |
| **Git** | Latest | Version control |
| **Tambo API Key** | - | AI features (required) |
| **GitHub PAT** | - | API access (recommended) |

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/contexthub.git
cd contexthub
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Tambo API Key
VITE_TAMBO_API_KEY=your_tambo_api_key_here

# Recommended: GitHub Personal Access Token
# Increases rate limits from 60/hour to 5000/hour
VITE_GITHUB_TOKEN=ghp_your_github_token_here
```

> ⚠️ **Security Warning**: Never commit `.env.local` or any file containing secrets to version control!

### 4️⃣ Start Development Server

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

---

## 📚 Documentation

### 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

### 🔑 Environment Variables

#### Required Variables

- **`VITE_TAMBO_API_KEY`** (Required)
  - API key for Tambo AI integration
  - Obtain from your [Tambo account](https://tambo.ai)
  - Missing this will cause runtime validation errors

#### Recommended Variables

- **`VITE_GITHUB_TOKEN`** (Recommended)
  - Personal Access Token for GitHub API
  - **Benefits**: 
    - Increases rate limits (60/hour → 5000/hour)
    - Access to private repositories
  - **Required Scopes**: 
    - `repo` (or `public_repo` for public repos only)
    - `read:user` (optional)

### 📁 Project Structure

```
contexthub/
├── src/
│   ├── app/
│   │   ├── providers.tsx      # Tambo AI provider setup
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── cards/            # UI card components
│   │   ├── layout/           # Layout components
│   │   ├── tambo/            # Tambo-specific components
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── tambo-registry.tsx # Component registry for AI
│   │   ├── thread-hooks.ts    # Thread management
│   │   └── utils.ts           # Utility functions
│   ├── services/
│   │   ├── github/           # GitHub API integration
│   │   ├── smart-search/     # Intelligent search
│   │   └── storage/          # Local storage utilities
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── package.json             # Project dependencies
```

---

## 🔐 Security Best Practices

### Environment Variable Security

1. **Never commit secrets**: Always use `.env.local` (already in `.gitignore`)
2. **Rotate compromised keys**: If any secret is accidentally committed, rotate it immediately
3. **Use minimal permissions**: Grant only necessary scopes to tokens

### Removing Secrets from Git History

If you accidentally committed secrets:

```bash
# Remove from tracking
git rm --cached .env
git commit -m "Remove environment file from tracking"

# Remove from history (⚠️ rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🛠️ Troubleshooting

### Common Issues

<details>
<summary><strong>❌ "Component props validation failed: Invalid input: expected string, received undefined"</strong></summary>

**Cause**: Missing `VITE_TAMBO_API_KEY` in `.env.local`

**Solution**: 
1. Create `.env.local` in project root
2. Add `VITE_TAMBO_API_KEY=your_key_here`
3. Restart dev server
</details>

<details>
<summary><strong>❌ GitHub API Rate Limit Exceeded</strong></summary>

**Cause**: No GitHub token configured (limited to 60 requests/hour)

**Solution**:
1. Create a GitHub Personal Access Token
2. Add `VITE_GITHUB_TOKEN=ghp_...` to `.env.local`
3. Restart dev server (rate limit increases to 5000/hour)
</details>

<details>
<summary><strong>❌ Dev Server Won't Start</strong></summary>

**Solutions**:
1. Check Node.js version: `node --version` (should be 18+)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear npm cache: `npm cache clean --force`
</details>

---

## 🚢 Deployment

### Deploy to GitHub Pages

```bash
# Build for production
npm run build

# Deploy dist folder to GitHub Pages
# (Use gh-pages package or GitHub Actions)
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/contexthub)

1. Import your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/contexthub)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

```bash
# Create a feature branch
git checkout -b feat/your-feature-name

# Make your changes
# ...

# Run quality checks
npm run lint
npm run build

# Commit with conventional commits
git add .
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feat/your-feature-name
```

### Code Review Guidelines

- ✅ Run `npm run lint` before pushing
- ✅ Include tests for non-trivial logic
- ✅ Write clear commit messages
- ✅ Update documentation for new features
- ✅ Ensure build passes: `npm run build`

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build/tooling changes

---

## 🗺️ Roadmap

### 🎯 Short-term Goals

- [ ] Add `.env.example` template
- [ ] Implement pre-commit hooks with Husky
- [ ] Add CI/CD pipeline with GitHub Actions
- [ ] Create comprehensive test suite

### 🚀 Medium-term Features

- [ ] **Code Review Automation**: Static analysis + SAST integration
- [ ] **Protected Branches**: Enforce PR reviews before merge
- [ ] **Security Scanning**: Snyk/Dependabot integration
- [ ] **Performance Monitoring**: Add analytics and metrics

### 🔮 Long-term Vision

- [ ] **AI-Powered Code Fixes**: Tambo skills for automated refactoring
- [ ] **Security-Focused AI**: Vulnerability detection and fixes
- [ ] **Multi-Repository Support**: Manage multiple repos simultaneously
- [ ] **Collaborative Features**: Team workspaces and shared insights
- [ ] **Plugin System**: Extensible architecture for custom integrations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [React](https://reactjs.org/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vite](https://vitejs.dev/) - Build Tool
- [Tambo AI](https://tambo.ai) - AI Integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Octokit](https://github.com/octokit) - GitHub API
- [Radix UI](https://www.radix-ui.com/) - Accessible Components

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by the ContextHub Team**

[Report Bug](https://github.com/yourusername/contexthub/issues) • [Request Feature](https://github.com/yourusername/contexthub/issues) • [Documentation](https://github.com/yourusername/contexthub/wiki)

</div>
