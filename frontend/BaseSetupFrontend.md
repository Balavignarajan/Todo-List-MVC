1. npx create-vite@latest frontend -- --template react
2.  cd frontend
3.   npm install
4. npm run dev
5. npm install axios react-router-dom

**Step 2 :**
1. create .env :
   eg : VITE_API_BASE_URL=http://localhost:5000

2. in the app.jsx file for routes..
      import { BrowserRouter, Routes, Route } from "react-router-dom";
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>

**Step 3 :**
1.  src/pages/Home.jsx


