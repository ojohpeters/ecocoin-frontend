import Image from "next/image"
import { Construction, Gamepad2, Leaf, Coins, Trophy, Users } from "lucide-react"

export default function MiniGame() {
  return (
    <div className="pt-24 pb-16 min-h-screen relative overflow-hidden">
      {/* Background Image - Add your background image to public/images/mini-game-bg.jpg */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/mini-game-bg.jpg" // Add this image to public/images/
          alt="Mini Game Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 to-white/90 dark:from-gray-900/80 dark:to-gray-800/90" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300">
              EcoCoin Mini Game
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Play and earn EcoCoin tokens while learning about sustainability
            </p>
          </div>

          <div className="eco-card p-8 text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Construction className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Coming Soon!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Our mini-game is currently under development. Play interactive games to earn EcoCoin tokens while learning
              about environmental sustainability.
            </p>

            {/* Game Preview Image - Add your game preview image to public/images/game-preview.jpg */}
            <div className="relative w-full h-64 md:h-80 mb-8 rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
              <Image
                src="/images/game-preview.jpg" // Add this image to public/images/
                alt="Mini Game Preview"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                <div className="flex items-center mb-2">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  <span className="font-bold text-lg">EcoCoin Adventure</span>
                </div>
                <p className="text-sm opacity-90">
                  Plant virtual trees, clean virtual oceans, and earn real EcoCoin tokens!
                </p>
              </div>
            </div>

            {/* Game Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  Environmental Challenges
                </h3>
                <ul className="text-left space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Plant and grow virtual forests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Clean up polluted environments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Build sustainable cities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Earn & Compete
                </h3>
                <ul className="text-left space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Earn real EcoCoin tokens</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Compete on global leaderboards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 flex-shrink-0 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Unlock achievements and rewards</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Coming Soon Features
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-100">Multiplayer Mode</p>
                  <p className="text-gray-600 dark:text-gray-400">Team up with friends</p>
                </div>
                <div className="text-center">
                  <Leaf className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-100">Real Impact</p>
                  <p className="text-gray-600 dark:text-gray-400">Fund real projects</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-100">NFT Rewards</p>
                  <p className="text-gray-600 dark:text-gray-400">Collectible achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
