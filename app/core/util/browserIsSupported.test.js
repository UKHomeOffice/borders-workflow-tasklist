import browserIsSupported from './browserIsSupported';

describe('browserIsSupported', () => {
  // Node's jsdom is not expected among user agents...
  const versions = 'chrome:64.0,edge:17.17134,ie:99,chromium-webview:64.0';
  const chrome =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.5.3987.132 Safari/537.36';
  const edge =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18362';
  const firefox =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:73.0) Gecko/20100101 Firefox/73.0';
  const ie = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  const webview = 'Mozilla/5.0 (Linux; Android 9; SM-N950F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 (AirWatch Browser v7.10.7)';

  it('throws error if versions is not a string', () => {
    const errorMessage = `detectBrowser expects a comma-delimited versions string—e.g. '${versions}'`;
    expect(() => browserIsSupported()).toThrowError(new Error(errorMessage));
    expect(() => browserIsSupported({}, edge)).toThrow(new Error(errorMessage));
    expect(() => browserIsSupported('', edge)).toThrow(new Error(errorMessage));
    expect(() => browserIsSupported(versions, edge)).not.toThrowError();
  });

  it('automatically reports supported if user agent is not found in versions at all', () => {
    expect(browserIsSupported(versions, firefox)).toBe(true);
  });

  it('reports not supported if user agent major version < versions', () => {
    expect(browserIsSupported('chrome:76.0,edge:179.0,ie:99', ie)).toBe(false);
  });

  it('reports not supported if user agent major version === versions but user agent minor version < versions', () => {
    expect(browserIsSupported('chrome:80.7,edge:17.17134', chrome)).toBe(false);
  });

  it('reports supported if user agent major version === versions and user agent minor version > versions', () => {
    expect(browserIsSupported('chrome:76.0,edge:17.17135', edge)).toBe(true);
  });

  it('reports supported if user agent major version === versions and user agent minor version === versions', () => {
    expect(browserIsSupported('chrome:76.0,edge:17.17134', edge)).toBe(true);
  });

  it('reports supported if user agent major version > versions and user agent minor version === versions', () => {
    expect(browserIsSupported('chrome:76.5,edge:17.17134', chrome)).toBe(true);
  });

  it('reports supported if user agent major version > versions and user agent minor version < versions', () => {
    expect(browserIsSupported('chrome:76.0,edge:18.17133', edge)).toBe(true);
  });

  it('reports supported if user agent major version > versions and user agent minor version > versions', () => {
    expect(browserIsSupported(versions, chrome)).toBe(true);
  });

  it('reports supported if user agent major version > versions but minor version is undefined', () => {
    expect(browserIsSupported('chrome:76,edge:18.17133', chrome)).toBe(true);
  });

  it('reports supported if user agent major version === versions but minor version is undefined', () => {
    expect(browserIsSupported('chrome:76.0,edge:18', edge)).toBe(true);
  });

  it('reports not supported if user agent major version < versions but minor version is undefined', () => {
    expect(browserIsSupported('chrome:76.0,edge:18.17133,ie:99,chromium-webview:75', webview)).toBe(
      false,
    );
  });
});
