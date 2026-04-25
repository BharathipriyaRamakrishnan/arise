import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authAPI, playerAPI } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  player: null,
  loading: true,
  xpNeeded: 100,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':    return { ...state, user: action.payload, loading: false };
    case 'SET_PLAYER':  return { ...state, player: action.payload.player, xpNeeded: action.payload.xpNeeded ?? state.xpNeeded };
    case 'UPDATE_PLAYER': return { ...state, player: { ...state.player, ...action.payload } };
    case 'LOGOUT':      return { ...initialState, loading: false };
    case 'DONE_LOADING': return { ...state, loading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshPlayer = useCallback(async () => {
    try {
      const res = await playerAPI.get();
      dispatch({ type: 'SET_PLAYER', payload: res.data });
    } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('arise_token');
    if (!token) { dispatch({ type: 'DONE_LOADING' }); return; }

    authAPI.me()
      .then(async (res) => {
        dispatch({ type: 'SET_USER', payload: res.data.user });
        if (res.data.user.player?.onboardingComplete) {
          await refreshPlayer();
        }
      })
      .catch(() => {
        localStorage.removeItem('arise_token');
        dispatch({ type: 'DONE_LOADING' });
      });
  }, [refreshPlayer]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('arise_token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    if (res.data.user.player?.onboardingComplete) await refreshPlayer();
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authAPI.register({ username, email, password });
    localStorage.setItem('arise_token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('arise_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updatePlayer = (updates) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshPlayer, updatePlayer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
