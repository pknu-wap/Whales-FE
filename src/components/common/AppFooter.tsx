import { Separator } from "../ui"



function AppFooter() {
  return (
    <footer className="w-full flex felx-col">
      <div className="w-full max-w-[1328px]  flex flex-col gap-6 p-6 pb-18">
        <div className="w-full flex items-center justify-bottom">
          <div className="flex flex-col items-start justify-between">
            <div className="flex felx-col items-start">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">나의 학습여정이</h3>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">공유되는 플랫폼</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">
              이용약관
            </p>
            <Separator orientation="vertical" className="!h-[14px]" />
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">
              개인정보처리방침
            </p>
            <Separator orientation="vertical" className="!h-[14px]" />
            <p className="cursor-pointer transition-all duration-500 hover:font-medium">
              서비스 이용 문의
            </p>
          </div>
        </div>
        <Separator />
        <div></div>
      </div>
    </footer>
  );
}

export {AppFooter}