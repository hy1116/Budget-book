import { useState } from 'react'
import './App.css'

function App() {
  const [budgets, setBudgets] = useState([])

  return (
    <div className="App">
      <h1>Budget Book</h1>
      <p>Welcome to your Budget Management App</p>

      <div className="budget-list">
        <h2>My Budgets</h2>
        {budgets.length === 0 ? (
          <p>No budgets yet. Create your first budget!</p>
        ) : (
          budgets.map(budget => (
            <div key={budget.id}>{budget.name}</div>
          ))
        )}
      </div>
    </div>
  )
}

export default App
