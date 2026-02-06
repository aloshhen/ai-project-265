import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { clsx, ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// SafeIcon component for Lucide icons
const iconCache = {}

const SafeIcon = ({ name, size = 24, className, color }) => {
  const [IconComponent, setIconComponent] = useState(null)

  useEffect(() => {
    if (iconCache[name]) {
      setIconComponent(() => iconCache[name])
      return
    }

    import('lucide-react').then((icons) => {
      const pascalName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')

      const Component = icons[pascalName] || icons.HelpCircle
      iconCache[name] = Component
      setIconComponent(() => Component)
    })
  }, [name])

  if (!IconComponent) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  return <IconComponent size={size} className={className} color={color} />
}

// Theme Context
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
})

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('lego-theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('lego-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const useTheme = () => useContext(ThemeContext)

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-110"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SafeIcon name="sun" size={20} className="text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SafeIcon name="moon" size={20} className="text-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

// Product Card Component
const ProductCard = ({ product, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-800"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-800">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {product.badge}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-4 left-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <SafeIcon name="shopping-cart" size={18} />
          В корзину
        </motion.button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            {product.age}+
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.pieces} деталей
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-red-500">
            {product.price} ₽
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <SafeIcon name="star" size={16} className="fill-current" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-b border-gray-200 dark:border-slate-800 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors"
        >
          <SafeIcon name="chevron-down" size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Main App Component
function App() {
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const products = [
    {
      id: 1,
      name: "LEGO Star Wars Звезда Смерти",
      price: 8499,
      age: 14,
      pieces: 2345,
      rating: 4.9,
      badge: "Хит",
      image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80"
    },
    {
      id: 2,
      name: "LEGO Technic Lamborghini",
      price: 12999,
      age: 18,
      pieces: 3869,
      rating: 5.0,
      badge: "Новинка",
      image: "https://images.unsplash.com/photo-1590227763209-821c686b0986?w=600&q=80"
    },
    {
      id: 3,
      name: "LEGO Creator Замок Неuschwanstein",
      price: 5499,
      age: 16,
      pieces: 1560,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80"
    },
    {
      id: 4,
      name: "LEGO Marvel Колизей",
      price: 15999,
      age: 18,
      pieces: 9036,
      rating: 4.9,
      badge: "Эксклюзив",
      image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80"
    },
    {
      id: 5,
      name: "LEGO Harry Хогвартс",
      price: 9999,
      age: 16,
      pieces: 6020,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80"
    },
    {
      id: 6,
      name: "LEGO Architecture Тадж-Махал",
      price: 7499,
      age: 16,
      pieces: 5923,
      rating: 4.7,
      badge: "Скидка",
      image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80"
    }
  ]

  const faqs = [
    {
      question: "Какая гарантия на конструкторы LEGO?",
      answer: "Все конструкторы имеют официальную гарантию LEGO на 2 года. Если вы обнаружили брак или недостающие детали, мы бесплатно заменим их. Также действует расширенная гарантия магазина на 30 дней с момента покупки."
    },
    {
      question: "Сколько времени занимает доставка?",
      answer: "Доставка по Москве и Санкт-Петербургу занимает 1-2 дня. В другие регионы России — 3-7 дней в зависимости от удаленности. При заказе от 5000 ₽ доставка бесплатная."
    },
    {
      question: "Есть ли скидки для постоянных клиентов?",
      answer: "Да! У нас действует накопительная бонусная программа. С каждой покупки вы получаете 5% бонусов, которые можно потратить на следующий заказ. Также регулярно проводим распродажи и специальные акции."
    },
    {
      question: "Как узнать, подойдет ли набор по возрасту?",
      answer: "На каждом наборе указана рекомендуемая возрастная категория. Это не строгое ограничение, а ориентир по сложности сборки. Детям младше указанного возраста может потребоваться помощь взрослых."
    },
    {
      question: "Можно ли вернуть товар если он не понравился?",
      answer: "Да, вы можете вернуть нераспакованный конструктор в течение 14 дней с момента получения. Если упаковка вскрыта, но детали не использовались — возврат возможен в течение 7 дней."
    }
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 lego-pattern overflow-x-hidden">
        {/* HEADER */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800"
        >
          <div className="container mx-auto px-4 md:px-6 py-4">
            <nav className="flex items-center justify-between">
              <motion.a
                href="#"
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="text-white font-black text-xl">L</span>
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  LEGO<span className="text-red-500">STORE</span>
                </span>
              </motion.a>

              <div className="hidden md:flex items-center gap-8">
                {['Каталог', 'Новинки', 'Акции', 'FAQ'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item === 'Каталог' ? 'products' : item.toLowerCase())}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 font-semibold transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-full items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
                >
                  <SafeIcon name="shopping-cart" size={18} />
                  <span>Корзина</span>
                </motion.button>
                <button className="md:hidden p-2 text-gray-700 dark:text-gray-300">
                  <SafeIcon name="menu" size={24} />
                </button>
              </div>
            </nav>
          </div>
        </motion.header>

        {/* HERO SECTION */}
        <section
          ref={heroRef}
          className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 overflow-hidden"
        >
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-full mb-6"
                >
                  <SafeIcon name="flame" size={16} />
                  <span className="text-sm">Новая коллекция 2024</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-none mb-6 tracking-tighter"
                >
                  СТРОЙ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                    МЕЧТЫ
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed"
                >
                  Официальные наборы LEGO для детей и взрослых. Открой мир безграничного творчества с оригинальными конструкторами.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection('products')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transition-all"
                  >
                    <SafeIcon name="shopping-bag" size={20} />
                    Смотреть каталог
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold text-lg px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                  >
                    <SafeIcon name="play-circle" size={20} />
                    Видео-обзор
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center gap-8 mt-12"
                >
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700 border-2 border-white dark:border-slate-950 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map((i) => (
                        <SafeIcon key={i} name="star" size={16} className="text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-gray-900 dark:text-white">10,000+</span> довольных клиентов
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-square">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      y: [0, -10, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80"
                      alt="LEGO Set"
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-2xl rotate-12 opacity-80 blur-sm" />
                  <div className="absolute bottom-20 left-10 w-16 h-16 bg-blue-500 rounded-full opacity-60 blur-sm" />
                  <div className="absolute top-1/2 right-0 w-12 h-12 bg-red-500 rounded-lg -rotate-12 opacity-70 blur-sm" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-4 md:px-6 bg-gray-50 dark:bg-slate-900/50">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'truck', title: 'Быстрая доставка', desc: '1-2 дня по Москве и СПб', color: 'blue' },
                { icon: 'shield-check', title: 'Оригинал 100%', desc: 'Официальная гарантия LEGO', color: 'green' },
                { icon: 'refresh-cw', title: 'Легкий возврат', desc: '14 дней на возврат', color: 'red' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-red-500/50 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                    <SafeIcon
                      name={feature.icon}
                      size={28}
                      className={`text-${feature.color}-500`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section id="products" className="py-20 md:py-32 px-4 md:px-6">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block text-red-500 font-bold text-sm uppercase tracking-wider mb-4">
                Популярные наборы
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                ЛУЧШИЕ <span className="text-red-500">ПРЕДЛОЖЕНИЯ</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Выбирай из самых популярных наборов LEGO этого сезона
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Смотреть все товары
                <SafeIcon name="arrow-right" size={20} />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                ПОЛУЧИ СКИДКУ 20%
              </h2>
              <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-2xl mx-auto">
                На первый заказ при подписке на нашу рассылку. Будь в курсе новинок и акций!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Введите ваш email"
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-xl transition-all"
                >
                  Подписаться
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 md:py-32 px-4 md:px-6">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block text-red-500 font-bold text-sm uppercase tracking-wider mb-4">
                FAQ
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                Частые <span className="text-red-500">вопросы</span>
              </h2>
            </motion.div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-12 px-4 md:px-6 telegram-safe-bottom">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-xl">L</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    LEGO<span className="text-red-500">STORE</span>
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">
                  Официальный магазин LEGO конструкторов. Только оригинальная продукция с гарантией качества.
                </p>
                <div className="flex gap-4">
                  {['facebook', 'instagram', 'youtube', 'twitter'].map((social) => (
                    <motion.a
                      key={social}
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                    >
                      <SafeIcon name={social} size={18} />
                    </motion.a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Каталог</h4>
                <ul className="space-y-2">
                  {['Star Wars', 'Technic', 'Creator', 'Marvel', 'Harry Potter', 'Architecture'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Помощь</h4>
                <ul className="space-y-2">
                  {['Доставка', 'Оплата', 'Возврат', 'Гарантия', 'Контакты', 'Отзывы'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                © 2024 LEGO Store. Все права защищены.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-red-500 transition-colors">
                  Политика конфиденциальности
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-red-500 transition-colors">
                  Условия использования
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App