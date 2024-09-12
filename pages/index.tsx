
import { Inter } from 'next/font/google'
import Dashboard from './dashboard'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'><Dashboard/></div>
  )
}
