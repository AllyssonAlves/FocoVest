export default function RankingPage() {
  const rankings = [
    { position: 1, name: 'Ana Silva', score: 950, university: 'UFC' },
    { position: 2, name: 'João Pedro', score: 920, university: 'UECE' },
    { position: 3, name: 'Maria Santos', score: 895, university: 'UVA' },
    { position: 4, name: 'Carlos Lima', score: 870, university: 'URCA' },
    { position: 5, name: 'Fernanda Costa', score: 845, university: 'IFCE' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ranking</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Top 5 - Ranking Geral</h2>
        
        <div className="space-y-4">
          {rankings.map((user, index) => (
            <div 
              key={user.position}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                index === 2 ? 'bg-orange-50 border border-orange-200' :
                'bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-500' :
                  index === 2 ? 'bg-orange-500' :
                  'bg-primary-500'
                }`}>
                  {user.position}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.university}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">{user.score}</p>
                <p className="text-sm text-gray-600">pontos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}