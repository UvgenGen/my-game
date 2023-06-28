function Message(context) {
  const {id, message, user, publish_date: date} = context;
  return (
    <div className="p-6 mb-6 text-base bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900" key={id}>
      <footer className="flex justify-between items-center mb-2">
          <div className="flex items-center">
              <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white">
                <img
                  className="mr-2 w-10 h-10 rounded-full"
                  src={user?.profile_image_url}
                  alt={user.username}/>
                {user.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
          </div>
          <button
              className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-400 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              type="button">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                      d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z">
                  </path>
              </svg>
              <span className="sr-only">Comment settings</span>
          </button>
      </footer>
      <p className="text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{__html: message.replace(/\n/g, "<br />")}}/>
    </div>
  )
}

export default Message