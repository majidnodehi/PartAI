import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description:
    'Error body returned when a request is invalid or a record does not exist.',
})
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code.',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description:
      'Error text. A validation failure returns one message for each invalid field.',
    oneOf: [
      { type: 'string', example: 'Rule not found.' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['title must be longer than or equal to 1 characters'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Short HTTP error name, such as Bad Request or Not Found.',
    example: 'Bad Request',
  })
  error!: string;
}
