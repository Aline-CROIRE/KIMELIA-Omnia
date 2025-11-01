// styled.d.ts (at the root of your project)
import 'styled-components/native';
import { AppTheme } from './src/contexts/ThemeContext'; // Adjust path if styled.d.ts is in src/

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}