export interface CommandValidation {
  allowed: boolean;
  risk: 'low' | 'medium' | 'high';
  reason?: string;
  requiresConfirmation: boolean;
}

export class SecurityService {
  private dangerousCommands = [
    'rm -rf',
    'del /f /s /q',
    'format',
    'dd if=',
    'mkfs',
    '> /dev/',
    'chmod 777',
    'chmod -R 777',
  ];

  private highRiskPatterns = [
    /rm\s+-rf\s+\//,
    /sudo\s+rm/,
    /:\(\)\{\s*:\|:&\s*\};:/,  // fork bomb
    /dd\s+if=/,
    /mkfs/,
    /fdisk/,
    />\s*\/dev\//,
  ];

  private mediumRiskPatterns = [
    /sudo/,
    /chmod/,
    /chown/,
    /rm\s+-r/,
    /curl.*\|\s*bash/,
    /wget.*\|\s*sh/,
  ];

  validateCommand(command: string): CommandValidation {
    const trimmedCommand = command.trim();

    for (const dangerous of this.dangerousCommands) {
      if (trimmedCommand.includes(dangerous)) {
        return {
          allowed: false,
          risk: 'high',
          reason: `Command contains dangerous pattern: ${dangerous}`,
          requiresConfirmation: true,
        };
      }
    }

    for (const pattern of this.highRiskPatterns) {
      if (pattern.test(trimmedCommand)) {
        return {
          allowed: false,
          risk: 'high',
          reason: 'Command matches high-risk pattern',
          requiresConfirmation: true,
        };
      }
    }

    for (const pattern of this.mediumRiskPatterns) {
      if (pattern.test(trimmedCommand)) {
        return {
          allowed: true,
          risk: 'medium',
          reason: 'Command requires elevated privileges or modifies system',
          requiresConfirmation: true,
        };
      }
    }

    return {
      allowed: true,
      risk: 'low',
      requiresConfirmation: false,
    };
  }

  sanitizeOutput(output: string): string {
    const secretPatterns = [
      /(?:api[_-]?key|apikey)[\s:=]+['"]?([a-zA-Z0-9_\-]+)['"]?/gi,
      /(?:password|passwd|pwd)[\s:=]+['"]?([^\s'"]+)['"]?/gi,
      /(?:token)[\s:=]+['"]?([a-zA-Z0-9_\-\.]+)['"]?/gi,
      /(?:secret)[\s:=]+['"]?([a-zA-Z0-9_\-]+)['"]?/gi,
    ];

    let sanitized = output;
    for (const pattern of secretPatterns) {
      sanitized = sanitized.replace(pattern, (match, secret) => {
        return match.replace(secret, '***REDACTED***');
      });
    }

    return sanitized;
  }

  encryptApiKey(apiKey: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const base64 = Buffer.from(data).toString('base64');
    return base64;
  }

  decryptApiKey(encryptedKey: string): string {
    const buffer = Buffer.from(encryptedKey, 'base64');
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  validateFilePath(filePath: string, allowedPaths: string[]): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    for (const allowedPath of allowedPaths) {
      const normalizedAllowed = allowedPath.replace(/\\/g, '/');
      if (normalizedPath.startsWith(normalizedAllowed)) {
        return true;
      }
    }

    return false;
  }

  shouldFilterFile(filePath: string): boolean {
    const sensitivePatterns = [
      /\.env$/,
      /\.env\./,
      /secret/i,
      /password/i,
      /\.pem$/,
      /\.key$/,
      /\.cert$/,
      /id_rsa/,
      /\.ssh\//,
    ];

    return sensitivePatterns.some(pattern => pattern.test(filePath));
  }
}
