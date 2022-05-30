import React, { useState, useRef } from 'react'
import { SignPan } from 'XsComponents'
import '../assets/style/index.css'
export default () => {
  const pan1 = useRef(null)
  const pan2 = useRef(null)

  const [src, setSrc] = useState('')

  return (
    <>
      <SignPan
        style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}
        strokeStyle='red'
        lineWidth={10}
        ref={pan1}
      />
      <SignPan
        className='panel'
        ref={pan2}
      />
      <img style={{ maxWidth: '100%' }} src={src} />
      <div>
        <button onClick={() => pan1.current.clear()}>清除1</button>
        <button onClick={() => setSrc(pan1.current.save())}>保存1</button>
      </div>
      <div>
        <button onClick={() => pan2.current.clear()}>清除2</button>
        <button onClick={() => setSrc(pan2.current.save())}>保存2</button>
      </div>
    </>
  )
}