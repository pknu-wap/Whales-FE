import { Button, Separator } from '../ui'; // 1. import 경로를 별칭('@/') 대신 상대 경로('../')로 수정합니다.

// 2. 'export function' 자체가 이름있는 내보내기이므로,
export function AppFooter() {
  return (
    // 2. 푸터 전체 배경색을 밝은 파란색 계열로 변경하고, 텍스트 색상을 대비되게 조정합니다.
    <footer className="w-full flex flex-col items-center justify-center bg-blue-400 text-blue-50">
      <div className="w-full max-w-[1328px] flex flex-col gap-6 p-6 pb-18">
        <div className="w-full flex items-start justify-between">
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col items-start">
              {' '}
              {/* 'tems-start' 오타 수정 */}
              {/* 3. 제목 텍스트 색상을 더 밝게 변경 */}
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-white">
                Whales 커뮤니티에 오신 것을,
              </h3>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-white">
                환영합니다
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* 4. SNS 버튼 스타일 변경 (파란색 배경에 흰색 아이콘) */}
              <Button
                variant={'ghost'}
                size={'icon'}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2"
              >
                {/* 이미지 좌표 */}
                {/* <img src="/assets/" alt="@SNS" className="w-6 h-6" />{' '} */}
                {/* 이미지 크기 일관성 있게 조정 */}
              </Button>
              <Button
                variant={'ghost'}
                size={'icon'}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2"
              >
                {/* 이미지 좌표 */}
                {/* <img src="/assets/" alt="@SNS" className="w-6 h-6" />{' '} */}
                {/* 이미지 크기 일관성 있게 조정 */}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-blue-200">
            {' '}
            {/* 5. 링크 텍스트 색상 조정 */}
            <p className="cursor-pointer transition-all duration-300 hover:text-white hover:font-medium">
              이용약관
            </p>
            {/* 6. 구분선 색상 조정 */}
            <Separator
              orientation="vertical"
              className="!h-[14px] bg-blue-400"
            />
            <p className="cursor-pointer transition-all duration-300 hover:text-white hover:font-medium">
              개인정보처리방침
            </p>
            <Separator
              orientation="vertical"
              className="!h-[14px] bg-blue-400"
            />
            <p className="cursor-pointer transition-all duration-300 hover:text-white hover:font-medium">
              서비스 이용 문의
            </p>
          </div>
        </div>
        {/* 7. 메인 구분선 색상 조정 */}
        <Separator className="bg-blue-600" />
        <div className="w-full flex items-start justify-between text-blue-200">
          {' '}
          {/* 8. 하단 텍스트 색상 조정 */}
          <div className="h-full flex flex-col justify-between">
            <div className="flex flex-col">
              <p className="h-10 text-base font-semibold text-white">
                고객센터
              </p>{' '}
              {/* 9. 제목 텍스트 색상 조정 */}
              <div className="flex flex-col items-start gap-1">
                <p>평일 : 시간일자</p>
                <p>문의 : 필요한 이메일</p>
              </div>
            </div>
            <p className="text-blue-300">@ Whales Team all rights reserved</p>{' '}
            {/* 10. 저작권 텍스트 색상 조정 */}
          </div>
          <div className="flex flex-col mr-[66px]">
            <p className="h-10 text-base font-semibold text-white">
              사업자 정보
            </p>{' '}
            {/* 11. 제목 텍스트 색상 조정 */}
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

// 12. "Multiple exports" 에러를 피하기 위해 중복된 export 라인을 제거합니다.
// export { AppFooter };
