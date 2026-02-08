// src/services/github/content.ts

/**
 * ULTIMATE FIX: Using native fetch() instead of Octokit
 * This completely bypasses all Octokit URL encoding issues
 */

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string> {
  try {
    // Clean path
    const cleanPath = path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Build URL manually - NO encoding of the path part
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${branch}`;
    
    console.log(`📄 Fetching file: ${owner}/${repo}/${cleanPath}@${branch}`);
    console.log(`🔧 Using native fetch API (NOT Octokit)`);
    console.log(`🌐 Full URL: ${url}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ GitHub API error:`, {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorData
      });
      
      if (response.status === 404 && branch === 'main') {
        console.log(`🔄 Trying alternative branch: master`);
        return await fetchFileContent(owner, repo, path, 'master');
      }
      
      if (response.status === 404) {
        throw new Error(`File ${cleanPath} not found in ${owner}/${repo}@${branch}`);
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please add VITE_GITHUB_TOKEN to .env');
      } else if (response.status === 401) {
        throw new Error('GitHub authentication failed. Check your VITE_GITHUB_TOKEN');
      }
      
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if it's a directory
    if (Array.isArray(data)) {
      throw new Error(`Path "${cleanPath}" is a directory, not a file`);
    }
    
    // Check if it's a file with content
    if (data.type === 'file' && data.content) {
      const isBinary = isBinaryFile(cleanPath);
      
      if (isBinary) {
        console.log(`🖼️ Binary file detected: ${cleanPath}`);
        return `[BINARY_FILE]${data.download_url || ''}`;
      }
      
      // Decode base64 content
      const content = atob(data.content.replace(/\n/g, ''));
      console.log(`✅ File fetched successfully:`, {
        path: cleanPath,
        size: content.length,
        lines: content.split('\n').length
      });
      return content;
    }
    
    throw new Error('Unexpected response format from GitHub API');
  } catch (error: any) {
    console.error(`❌ Failed to fetch ${path}:`, error.message);
    throw error;
  }
}

function isBinaryFile(filename: string): boolean {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'mp3', 'wav', 'ogg', 'flac',
    'zip', 'tar', 'gz', 'rar', '7z',
    'exe', 'dll', 'so', 'dylib',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'ttf', 'otf', 'woff', 'woff2',
    'bin', 'dat', 'db', 'sqlite'
  ];
  
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return binaryExtensions.includes(ext);
}

export async function fetchREADME(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<string> {
  const readmeFiles = ['README.md', 'README', 'readme.md', 'Readme.md'];
  
  for (const filename of readmeFiles) {
    try {
      return await fetchFileContent(owner, repo, filename, branch);
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('README not found in repository');
}

export async function fetchPackageJSON(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<any> {
  const content = await fetchFileContent(owner, repo, 'package.json', branch);
  return JSON.parse(content);
}

export async function fetchFileContentMultipleBranches(
  owner: string,
  repo: string,
  path: string,
  branches: string[] = ['main', 'master', 'develop']
): Promise<{ content: string; branch: string }> {
  for (const branch of branches) {
    try {
      const content = await fetchFileContent(owner, repo, path, branch);
      return { content, branch };
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`File ${path} not found in any branch`);
}