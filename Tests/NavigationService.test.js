import * as NavigationService from './NavigationService';

describe('NavigationService', () => {
  it('should navigate correctly', () => {
    const navigate = jest.fn();
    NavigationService.setTopLevelNavigator({ navigate });
    NavigationService.navigate('Home');
    expect(navigate).toHaveBeenCalledWith('Home');
  });

  it('should go back correctly', () => {
    const goBack = jest.fn();
    NavigationService.setTopLevelNavigator({ goBack });
    NavigationService.goBack();
    expect(goBack).toHaveBeenCalled();
  });
});