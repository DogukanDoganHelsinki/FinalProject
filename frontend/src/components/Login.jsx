import { useState } from 'react'
import './Login.scss'

function Login({ login, register }) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const onUsernameInput = (event) => {
        setUsername(event.target.value);
    }
    const onPasswordInput = (event) => {
        setPassword(event.target.value);
    }

    return (
        <div className='loginMain'>
            <legend>Username</legend>
            <input value={username} onChange={onUsernameInput} type='text' />
            <legend>Password</legend>
            <input value={password} onChange={onPasswordInput} type='password' />
            <div>
                <div className='btn' onClick={() => login(username, password)}>Login</div>
                <div className='btn' onClick={() => register(username, password)}>Register</div>
            </div>
        </div >
    )
}

export default Login