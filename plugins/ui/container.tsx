import { cloneElement, useState, type ReactElement } from "react";
import type { Prop } from "./main";

export function Container({
	props: initialProps,
	name,
	children: Children
}: {
	props: Prop[],
	name: string
	children: ReactElement
}) {
	const [props, setProps] = useState<Array<Prop & { value: string }>>(() => {
		return initialProps.map((prop) => ({ ...prop, value: '' }))
	})
	// initialize react states using props as initial values
	// render child component with props's states current state
	const Component = cloneElement(Children, { props });
	console.log('Component', Component)

	return (
		<article
			key={`container-${name}`}
			style={{ border: '2px solid darkviolet', marginBottom: '8px', padding: '8px' }}
		>
			<section
				style={{ border: '2px solid orange', marginBottom: '8px', padding: '8px' }}
			>
				{
					props.map(({ type, name, value }) => {
						if (type.type === 'number') {
							return (
								<input type="number" />
							)
						}

						if (type.type === 'union') {
							return (
								<select>
									{
										type.value.map((unionItem) => {
											return (
												<option key={`container-${name}-union-${unionItem}`}>
													{unionItem}
												</option>
											)
										})
									}
								</select>
							)
						}

						if (type.type === 'string') {
							return (
								<input type="text" value={value} onChange={(e) => {
									setProps((prevProps) => {
										const index = prevProps.findIndex((prop) => prop.name === name)
										return replaceInArray(
											index,
											{ type, name, value: e.target.value },
											prevProps
										)
									})
								}} />
							)
						}
					})}
			</section>
			<section>
				{Component}
			</section>
		</article>
	)
}

function replaceInArray<T>(index: number, nextValue: T, items: T[]): T[] {
	return items.map((item, i) => (i === index ? nextValue : item))
}
