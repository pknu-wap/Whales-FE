import React, { useState } from 'react';
import './App.css';

function App() {
  // 이제 todos는 단순한 문자열 배열이 아닌,
  // { id, text, completed } 형태의 객체 배열로 관리합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // '추가' 버튼을 누르면 실행될 함수
  const addTodo = () => {
    if (input.trim() === '') return;

    // 새로운 할 일을 객체 형태로 만들어 배열에 추가합니다.
    // id: 각 항목을 구분하기 위한 고유 값
    // text: 할 일 내용
    // completed: 완료 여부 (기본값은 false)
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setInput('');
  };

  // 체크박스를 클릭했을 때 실행될 함수
  // 어떤 항목을 체크했는지 알아야 하므로 id를 받습니다.
  const toggleTodo = (id) => {
    // todos 배열을 순회하면서 id가 일치하는 항목을 찾습니다.
    setTodos(
      todos.map(todo =>
        // 현재 todo의 id와 클릭된 id가 같다면,
        todo.id === id
          // completed 값을 반대로 바꿔줍니다. (false -> true, true -> false)
          ? { ...todo, completed: !todo.completed }
          // id가 다르면 기존 todo를 그대로 둡니다.
          : todo
      )
    );
  };


  return (
    <div className="App">
      <h1>Todo List with Checkbox</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="새로운 할 일을 입력하세요"
        />
        <button onClick={addTodo}>추가</button>
      </div>
      <ul>
        {/* todos 배열을 순회하며 각 todo 객체를 화면에 보여줍니다. */}
        {todos.map(todo => (
          // 각 li 태그에 고유한 key로 todo.id를 부여합니다.
          // todo.completed가 true이면 'completed' 라는 클래스를 추가합니다.
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {/* 체크박스를 추가합니다. */}
            <input
              type="checkbox"
              // 체크 상태를 todo.completed 값과 동기화합니다.
              checked={todo.completed}
              // 체크박스의 상태가 변할 때마다 toggleTodo 함수를 실행합니다.
              onChange={() => toggleTodo(todo.id)}
            />
            {/* 할 일 내용을 보여줍니다. */}
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;