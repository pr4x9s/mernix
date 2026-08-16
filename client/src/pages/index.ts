import { lazy } from 'react'


const Home = lazy(() => import('./Home.tsx'));
const Login = lazy(() => import('./Public/Login.tsx'));
const Register = lazy(() => import('./Public/Register.tsx'));
const Channel = lazy(() => import('./Private/Channel.tsx'));
const ProfileSettings = lazy(() => import('./Private/ProfileSettings.tsx'));
const WatchHistory = lazy(() => import('./Private/WatchHistory.tsx'));
const SearchResults = lazy(() => import('./Private/SearchResults.tsx'));
const CreatorDashboard = lazy(() => import('./Private/studio/CreatorDashboard.tsx'));
const StudioAnalytics = lazy(() => import('./Private/studio/StudioAnalytics.tsx'));
const StudioMyVideos = lazy(() => import('./Private/studio/StudioMyVideos.tsx'));


export {
    Home,
    Login,
    Register,
    Channel,
    ProfileSettings,
    WatchHistory,
    SearchResults,
    CreatorDashboard,
    StudioAnalytics,
    StudioMyVideos,
}