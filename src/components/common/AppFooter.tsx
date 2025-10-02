import { Button, Separator } from '../ui';

function AppFooter() {
  return (
    <footer className="w-full flex flex-col items-center justify-center bg-[#777777]">
      <div className="w-full max-w-[1328px] flex flex-col gap-6 p-6 pb-18">
        <div className="w-full flex items-start justify-between">
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col tems-start">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                나의 학습여정이,
              </h3>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                공유되는 플랫폼
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={'outline'} size={'icon'} className="border-0">
                <img src="/assets/" alt="@SNS" className="w-6 h-7 mt-[2px]" />
              </Button>
              <Button variant={'outline'} size={'icon'} className="border-0">
                <img src="/assets/" alt="@SNS" className="w-[22px] h-[22px]" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="cursor-pointer transition-all duration-300 hover:font-medium">
              이용약관
            </p>
            <Separator orientation="vertical" className="!h-[14px]" />
            <p className="cursor-pointer transition-all duration-300 hover:font-medium">
              개인정보처리방침
            </p>
            <Separator orientation="vertical" className="!h-[14px]" />
            <p className="cursor-pointer transition-all duration-300 hover:font-medium">
              서비스 이용 문의
            </p>
          </div>
        </div>
        <Separator />
        <div className="w-full flex items-start justify-between">
          <div className="h-full flex flex-col justify-between">
            <div className="flex flex-col">
              <p className="h-10 text-base font-semibold">고객센터</p>
              <div className="flex flex-col items-start gap-1">
                <p>평일 : 시간일자</p>
                <p>문의 : 필요한 이메일</p>
              </div>
              </div>
              <p>@ Whales Team all rights reserved</p>
            </div>
            <div className="flex flex-col mr-[66px]">
              <p className="h-10 text-base font-semibold">사업자 정보</p>
              <div className="flex flex-col items-start gap-1">
                <p>대표이사 : 홍길동</p>
                <p>사업자 번호 : 01234567</p>
                <p>통신판매신고번호 : 2025-대한민국-블라블라</p>
                <p>주소 : 부산광역시 </p>
                <p>대표번호 : 012-1234-5678</p>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
}

export { AppFooter };
