import { AppFooter, AppHeader, AppSidebar } from './components/common';
import { SkeletonHotTopic } from "./components/skeleton";
import { Skeleton } from "./components/ui";

// import { ThemeProvider } from './components/theme-provider';


function App() {
  return (
    // 아래에 주입 클래스는 다크모드가 가능하므로 꺼 놓았다
    // <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="page">
      <AppHeader />
      <div className="container">
        <main className="w-full h-full min-h-[720px] flex p-6 gap-6">
          {/* 카테고리 사이드바 */}
          <AppSidebar />
          {/* 토픽 콘텐츠 */}
          <section className="flex-1 flex flex-col gap-12">
            {/* 핫 토픽 */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {/* figma에서 필요한 사진 이렇게 폴더를 생성하여 저장할 것 */}
                  {/* <img src="/assets/fire.gif" alt="@IMG" className="w-7 h-7" /> */}
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    HOT 토픽
                  </h4>
                </div>
                <p className="md:text-base text-muted-foreground">
                  가장 주목받고 있는 댓글을 보세요
                </p>
              </div>
              {/* 그리드를 적용한 코드 */}
              {/* grid-cols가 4이므로 25프로씩 잡아줄 것이다 w-full을 아래에 적용했다 */}
              <div className="grid grid-cols-4 gap-6">
                <SkeletonHotTopic />
                <SkeletonHotTopic />
                <SkeletonHotTopic />
                <SkeletonHotTopic />
              </div>
            </div>
            {/* 뉴 토픽 */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {/* figma에서 필요한 사진 이렇게 폴더를 생성하여 저장할 것 */}
                  {/* <img src="/assets/fire.gif" alt="@IMG" className="w-7 h-7" /> */}
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    NEW 토픽
                  </h4>
                </div>
                <p className="md:text-base text-muted-foreground">
                  주목받을 댓글을 작성하세요!
                </p>
              </div>
              {/* 그리드를 적용한 코드 */}
              {/* grid-cols가 4이므로 25프로씩 잡아줄 것이다 w-full을 아래에 적용했다 */}
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="w-full h-[210px]" />
                <Skeleton className="w-full h-[210px]" />
                <Skeleton className="w-full h-[210px]" />
                <Skeleton className="w-full h-[210px]" />
              </div>
            </div>
          </section>
        </main>
      </div>
      <AppFooter />
    </div>
    // </ThemeProvider>
  );
}

export default App;
