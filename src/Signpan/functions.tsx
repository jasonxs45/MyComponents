import React from 'react'
interface SaveParameter {
  /**
   * 同canvas的toDataURL方法type参数，默认为image/png
  */
  type?: string
  /**
   * 同canvas的toDataURL方法encodeOptions参数
  */
  encodeOptions?: any
}

export const save: React.FC<SaveParameter> = ({ type = 'image/png' }) => <></>