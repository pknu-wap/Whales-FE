import { Button, Checkbox, Label } from "@/components/ui";
import { Asterisk } from "lucide-react";

export default function  SignIn() {
  return (
    <main className="w-full h-full min-h-[720px] items-center justify-center flex p-6 gap-6">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl front-semibold tracking-tight">
            로그인
          </h4>
          <p className="text-muted-foreground">구글 로그인으로 바로 시작하기</p>
        </div>
        <div className="grid gap-3">
          {/* 소셜 로그인 */}
          <Button type="button" variant={'secondary'}>
            <img
              src="/assets/icon/social/google.svg"
              alt="@GOOGLE-LOGO"
              className="w-[18px] h-[18px] mr-1"
            />
            구글 로그인
          </Button>
          {/* 경계선 */}
          {/* 이용자 약관동의 형식 */}
          <div className="grid gap-2">
            <div className="grid gap-2">
              <div className="flex items-center gap-1">
                <Asterisk size={14} className="text-[#F96859]" />
                {/* <Label>필수 동의항목</Label> */}
                필수 동의항목
              </div>
              <div className="flex flex-col">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox className="w-[18px] h-[18px]" />
                    서비스 이용약관 동의
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 회원가입 형식 */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-muted-foreground bg-black">START RIGHT NOW</span>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
}
