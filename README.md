# DEVChat

A production-quality developer AI chatbot built with React, TypeScript, and the OpenRouter API. Clean, modern dark UI with full Markdown rendering, code highlighting, file attachments, and conversation management.

## About

DEVChat is a frontend-only AI chat interface that connects to any model available through [OpenRouter](https://openrouter.ai/). No backend, no authentication server, no database — everything runs in your browser with data persisted to localStorage and IndexedDB.

It is designed as a polished, fully-featured developer chat tool with a dark-only UI, floating toolbar, and multi-page layout.

## What's Included

- **Multi-model support** — Switch between any OpenRouter model mid-conversation (GPT-4o, Claude, Gemini, DeepSeek, Llama, etc.)
- **Markdown rendering** — Full GFM support (tables, task lists, strikethrough) with syntax-highlighted code blocks
- **Syntax highlighting** — Tree-shaken highlight.js with 48 languages, one-click copy on code blocks
- **LaTeX / math** — KaTeX rendering for inline and block math (`$...$` and `$$...$$`)
- **Mermaid diagrams** — Dynamic-imported mermaid renderer with dark theme
- **File & image uploads** — Drag-and-drop or button, multimodal vision support for images
- **Streaming responses** — Real-time token-by-token output with cancel button
- **Conversation management** — Create, rename, delete, search, pin, and organize conversations into folders
- **Markdown export** — Export any conversation as a `.md` file from the context menu
- **Per-conversation system prompts** — Collapsible "Instructions" field above the chat input
- **Adjustable font size** — Small / Medium / Large, applied consistently across all message elements
- **Token count display** — Actual usage from API response when available, estimate otherwise
- **Onboarding wizard** — 3-step setup for API key, model, and preferences
- **Keyboard shortcuts** — `Ctrl+K` new chat, `Ctrl+Shift+F` search, `Ctrl+/` shortcuts help, and more
- **Mobile responsive** — Full drawer navigation, touch-friendly, responsive chat input
- **Data management** — Export all data as JSON, import from backup, clear with confirmation

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Routing | React Router 7 |
| Markdown | react-markdown, remark-gfm, remark-math, rehype-raw, rehype-katex |
| Code highlight | highlight.js (tree-shaken, 48 languages) |
| Math | KaTeX |
| Diagrams | Mermaid |
| Icons | Lucide React |
| Linting | oxlint |

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** (or yarn / pnpm)
- An **OpenRouter API key** — get one free at [openrouter.ai/keys](https://openrouter.ai/keys)

### Installation

```bash
git clone https://github.com/maisamabbas0323/DEVChat.git
cd DEVChat
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The onboarding wizard will guide you through API key and model setup.

### Build

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── chat/          # ChatInput, EmptyChatState, ConversationSearch, SystemPrompt, QuickActions
│   ├── code/          # CodeBlock (highlight.js), MermaidBlock
│   ├── dialogs/       # ConfirmDialog
│   ├── layout/        # AppLayout, Toolbar, MobileDrawer
│   ├── messages/      # MessageBubble, MessageList, MarkdownRenderer
│   ├── onboarding/    # Onboarding wizard
│   ├── settings/      # SettingsTabs, ExportData
│   ├── sidebar/       # ConversationSidebar, ConversationItem, FolderDialog
│   └── ui/            # Button, Spinner, Tooltip, Skeleton, ErrorBoundary, ShortcutsHelp
├── lib/
│   ├── highlight.js   # Tree-shaken highlight.js with 48 languages
│   ├── hooks.ts       # useTheme (dark-only), useKeyboardShortcuts
│   ├── idb.ts         # IndexedDB wrapper (idbSet, idbClear)
│   ├── storage.ts     # Dual-write localStorage + IndexedDB, export/import/clear
│   ├── folderStorage.ts  # Folder CRUD in localStorage
│   ├── utils.ts       # cn, generateId, formatTimestamp, shuffle, copyToClipboard
│   └── validation.ts  # API key, model ID validation
├── pages/             # Chat, Home, ApiConfig, Settings
├── services/
│   └── openrouter.ts  # OpenRouter API client (streaming + multimodal)
├── store/
│   ├── chatStore.ts   # Zustand store: conversations, messages, folders, search
│   └── settingsStore.ts  # Settings with localStorage persistence
├── types/
│   └── index.ts       # Conversation, Message, Attachment, Folder, Settings, etc.
├── index.css          # hljs themes, scrollbar, animations
├── App.tsx            # Router: /, /chat/:id, /api, /settings
└── main.tsx           # ErrorBoundary entry point
```

## Configuration

### API Key

Set your OpenRouter API key in the app via **Settings > API Configuration** or during onboarding. The key is stored locally in your browser and never sent anywhere except OpenRouter.

### Default Model

Choose your default model on the **Configuration** page (`/api`). You can also switch models per-conversation from the chat toolbar.

### Settings

Access via the gear icon in the toolbar or from the sidebar. Settings include:

- **Enter to send** vs **Ctrl+Enter to send**
- Stream responses (on/off)
- Show timestamps
- Show token counts
- Compact mode
- Auto-scroll
- Font size (Small / Medium / Large)
- Export / Import / Clear all data
- Reset settings

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | New chat |
| `Ctrl + Shift + F` | Search conversations |
| `Ctrl + /` | Show shortcuts |
| `Ctrl + E` | Export all data |
| `Escape` | Close modal / drawer |
| `Enter` | Send message (when "Enter to send" is on) |
| `Ctrl + Enter` | Send message (when "Ctrl+Enter to send" is on) |

## Data Storage

All data is stored locally in your browser:

| Data | Storage |
|------|---------|
| Conversations, settings, API config | localStorage + IndexedDB (dual-write) |
| Folders | localStorage (`devchat_folders`) |

Use **Export** in Settings to download a JSON backup. Use **Import** to restore from a backup file.

## License

MIT
