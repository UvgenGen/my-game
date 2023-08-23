import { useGameContext } from '../context/GameContext'

export default function GameBoard() {
  const { roundData } = useGameContext();

  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <tbody className="text-xs uppercase">
        {roundData?.themes?.map((theme, themeIndex) => (
          <tr className="bg-white border dark:bg-gray-800 dark:border-gray-700" key={themeIndex}>
            <td className="border dark:bg-gray-800 dark:border-gray-700 px-6 py-3">
              {theme.name}
            </td>
            {theme.questions.map((question, index) => (
              <td
                key={index}
                className="border dark:bg-gray-800 text-center dark:border-gray-700 dark:hover:bg-gray-600"
              >
                {question.price}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
