export const Select = ({ children, ...props }) => <select {...props}>{children}</select>
export const SelectTrigger = ({ children, ...props }) => <div {...props}>{children}</div>
export const SelectValue = ({ children, ...props }) => <span {...props}>{children}</span>
export const SelectContent = ({ children, ...props }) => <div {...props}>{children}</div>
export const SelectItem = ({ children, value, ...props }) => <option value={value} {...props}>{children}</option>
