import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppFooter, AppHeader } from "./components/common"
import Main from "./components/pages/main/Main";
import MyPage from "./components/pages/mypage/MyPage";


function App() { 
  

  return (
    <BrowserRouter>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <AppFooter />
    </BrowserRouter>
  );
}

export default App
