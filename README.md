# 🍿 BingeVault — Entertainment & Backlog Tracker

![BingeVault Banner](https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80)

**BingeVault** is a modern, fast, all-in-one entertainment tracker designed specifically for tracking **Movies**, **TV Series**, **Anime**, and **Video Games**.

🌐 **Live Demo:** [https://bingevault.vercel.app](https://bingevault.vercel.app)

---

## 🌟 Key Features

- **4 Media Mediums Tailored with Custom Attributes**:
  - 🎬 **Movies**: Track runtime, directors, completion, and rewatch counts.
  - 📺 **TV Series**: Track current season, total seasons, episode progress (`S1 Ep 7/9`), and streaming networks.
  - ⛩️ **Anime**: Track episodes watched, season numbers, animation studios, and source material.
  - 🎮 **Video Games**: Track hours played, gaming platforms (PC, PS5, Switch, Steam Deck), completion percentage, and playstyles.
- **⚡ Live Online Search & Auto-Fill**:
  - Search any title in real-time across free public APIs (**Kitsu API** for Anime, **TVMaze** for Series, **Wikipedia REST API** for Movies & Games).
  - 1-click Auto-Fill brings in official high-res posters, release years, synopsis, and episode counts.
- **👤 User Sign-Up & Multi-Account System**:
  - Built-in authentication (Sign In & Sign Up) with personalized avatars.
  - Isolated libraries per user and automatic guest data migration.
- **3 Dynamic Views**:
  - **Cards Grid View** (with smooth hover effects and direct increment buttons)
  - **Compact List View** (for rapid backlog scanning)
  - **Kanban Board View** (Plan ➔ In Progress ➔ Completed ➔ On Hold ➔ Dropped)
- **Quick-Increment Actions**:
  - `+1 Ep` button for Anime/Series
  - `+1h` and `+5h` buttons for Games
  - Rewatch button for Movies
  - Celebratory confetti triggers upon title completion!
- **📊 Analytics & Insights**:
  - Total gaming hours, total episodes watched, completion rate %, category breakdown bar, and Hall of Fame (★ 9.0+).
- **🔗 1-Click Collection Sharing**:
  - Generate a shareable URL to share your library with friends, letting them view or merge libraries.
  - Full offline JSON backup export and import.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **Deployment**: Vercel

---

## 🚀 Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/bingevault.git
   cd bingevault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License — feel free to customize and enjoy!
