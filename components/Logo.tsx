import Image from 'next/image'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  withText?: boolean
}

const SIZES = { sm: 28, md: 40, lg: 60 }

export default function Logo({ size = 'md', withText = false }: Props) {
  const px = SIZES[size]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Image
        src="/VOVU LOGO OFICIAL.png"
        alt="Vovu"
        width={px}
        height={px}
        style={{ objectFit: 'contain' }}
        priority={size === 'lg'}
      />
      {withText && (
        <span style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          fontSize: size === 'sm' ? 16 : size === 'lg' ? 28 : 20,
          color: 'var(--forest)',
        }}>
          Vovu
        </span>
      )}
    </span>
  )
}
