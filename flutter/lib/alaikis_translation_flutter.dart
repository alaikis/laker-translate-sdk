/**
 * Alaikis Translation Service Flutter SDK
 *
 * A Flutter plugin for Alaikis Translation Service that provides:
 * - Local translation pool caching with automatic template extraction
 * - Persistent storage using Hive for offline usage
 * - gRPC client connection to api.laker.dev backend
 * - Server streaming translation support
 * - Maximum LLM quota savings through template reuse
 *
 * @version 1.6.148
 * @author Alaikis Team
 * @copyright Copyright (c) 2026 Alaikis
 */

library alaikis_translation_flutter;

// Export all public API
export 'src/template.dart';
export 'src/storage.dart';
export 'src/pool.dart';
export 'src/client.dart';

// Export generated Protobuf classes
export 'src/proto/translation.pb.dart';
export 'src/proto/translation.pbenum.dart';
export 'src/proto/translation.pbgrpc.dart';
