export const useAuth = () => {
  const accessToken = useState('accessToken', () => null)

  const isAuthenticated = computed(() => {
    return accessToken.value !== null && accessToken.value !== ''
  })

  function setAccessToken(token) {
    accessToken.value = token
  }

  function clearAccessToken() {
    accessToken.value = null
  }

  return { accessToken, isAuthenticated, setAccessToken, clearAccessToken }
}
