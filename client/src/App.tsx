// Application transformée en générateur automatique de JSON
// Aucune interface utilisateur n'est nécessaire
// Les pronostics sont générés automatiquement au démarrage du serveur
// et sauvegardés dans ./static/pronostics.json

export default function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Générateur Automatique de Pronostics Football</h1>
      <p>
        Ce système génère automatiquement des pronostics de football au démarrage du serveur.
      </p>
      <p>
        Les résultats sont sauvegardés dans le fichier <code>static/pronostics.json</code>.
      </p>
      <p>
        Aucune interaction utilisateur n'est requise. Le système fonctionne de manière autonome.
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h2>Comment ça fonctionne :</h2>
        <ol>
          <li>Au démarrage du serveur, l'API Football est interrogée pour obtenir les matchs du jour</li>
          <li>Les matchs sont analysés automatiquement</li>
          <li>Deux combinés sont générés : un "sûr" et un "risqué"</li>
          <li>Le résultat est sauvegardé dans <code>static/pronostics.json</code></li>
        </ol>
      </div>
    </div>
  );
}
