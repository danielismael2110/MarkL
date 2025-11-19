import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // Verificar preferencias guardadas o del sistema
        const savedTheme = localStorage.getItem('marklicor-theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setDarkMode(true)
            document.documentElement.classList.add('dark-theme')
        } else {
            setDarkMode(false)
            document.documentElement.classList.remove('dark-theme')
        }
    }, [])

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode
        setDarkMode(newDarkMode)
        
        if (newDarkMode) {
            document.documentElement.classList.add('dark-theme')
            localStorage.setItem('marklicor-theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark-theme')
            localStorage.setItem('marklicor-theme', 'light')
        }
    }

    const value = {
        darkMode,
        toggleDarkMode,
        setDarkMode
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}