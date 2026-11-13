export type Role='SUPER_ADMIN'|'ADMIN'|'RESELLER';

export type ApiUser={
  id:string;name:string;email:string;role:Role;credits:number;
  totalTokensCreated?:number;totalBandwidthAllocatedGb?:number;
  parentId?:string;parentName?:string;
};

export type HostTelemetry={
  observedAt:string;uptimeSeconds:number;cpuPercent:number;load1:number;
  totalMemoryBytes:number;freeMemoryBytes:number;diskTotalBytes:number;diskFreeBytes:number;
  services:{sshd:boolean;gateway:boolean;reconciler:boolean};
};

export type ManagedNode={
  id:string;name:string;host:string;enabled?:boolean;sshWsManaged?:boolean;
  sshWsFingerprint?:string;sshWsSni?:string;sshWsPort?:number;sshWsPath?:string;
  sshWsAgentSeenAt?:string;sshWsHost?:HostTelemetry|null;stale?:boolean;
  agentOnline?:boolean;hostTelemetry?:HostTelemetry|null;sni?:string;port?:number;path?:string;
};

export type SshAccount={
  id:string;username:string;label:string;nodeId:string;managed:boolean;
  provisionState:string;enabled:boolean;expiresAt:string;quotaBytes:number;usedBytes:number|null;
  online:number|null;maxConnections:number;trafficVerified:boolean;usageObservedAt?:string;effectiveEnabled:boolean;
  ready?:boolean;createdAt:string;resellerId?:string;resellerName?:string;
  connection?:{host?:string;transport:string;port:number};
};

export type SshInventory={enabled:boolean;sshWsReady:boolean;ready?:boolean;managedNodes:ManagedNode[];accounts:SshAccount[]};

export type Reseller={
  id:string;name:string;email:string;credits:number;status:string;createdAt?:string;
  lastLoginAt?:string|null;parentId?:string;parentName?:string;subResellersCount?:number;
  descendantCount?:number;hierarchyDepth?:number;hierarchyPath?:string[];
  pricePerGbCfa?:number;costPerGbCfa?:number;pricePerLicenceCfa?:number;
};

export type Transaction={
  id:string;resellerId?:string;resellerName:string;type:string;amountGb:number;
  balanceBefore:number;balanceAfter:number;note:string;timestamp:string;
};

export type Operator={id:string;name:string;email:string;role:'ADMIN';status:string;createdAt:string;lastLoginAt?:string|null};

export type OpsHealth={
  ok?:boolean;alerts?:string[];storage?:string;freeBytes?:number;uptimeSeconds?:number;
  memoryBytes?:number;loadAverage?:number[];backup?:{at:string;offsite:boolean;error?:string}|null;
};

export type SecurityStatus={
  mfaEnabled:boolean;mfaRequired:boolean;
  sessions:Array<{id:string;createdAt:number;ip?:string;agent?:string;current:boolean}>;
};

export type ClientConfig={
  format?:string;protocol?:string;username:string;password:string;path:string;sni:string;
  host:string;port:number;fingerprint:string;wire:string;transport:string;payload?:string|null;websocket?:boolean;
  expiresAt?:string;quotaGb?:number;usedGb?:number|null;trafficVerified?:boolean;
};

export type SshDevice={
  deviceKey:string;usedBytes:number;upBytes:number;downBytes:number;
  firstSeenAt?:string;lastSeenAt?:string;activeSessions?:number;ip?:string;
  userAgent?:string;name?:string;brand?:string;blocked:boolean;
};
