

function AppHeader() {
  return (
	// 헤더의 배경색은 정해지면 수정하겠음
	<header className="fixed top-0 z-10 w-full flex items-center justify-center bg-[#121212]">AppHeader
		<div className="w-full max-w-[1328px flex items-center justify-between px-6 py-3">
			{/*로고 & 네비게이션 메뉴 UI*/}
			<div className="flex items-center gap-5">
				<img src="https://github.com/GITJUSTDOIT" alt="@LOGO" />
				<div className="flex items-center gap-5">
					<div className="font-semibold">토픽 인사이트</div>
					
				</div>
			</div>
			<div className="font-semibold text-muted-foreground hover:text-white transition-all duration-500">로그인</div>
		</div>
	</header>
	
  )
}

export {AppHeader};