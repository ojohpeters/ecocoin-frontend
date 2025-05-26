import * as React from "react"
import { FaLeaf } from "react-icons/fa"

const Leaf = React.forwardRef(({ className, ...props }, ref) => <FaLeaf ref={ref} className={className} {...props} />)
Leaf.displayName = "Leaf"

export { Leaf }
